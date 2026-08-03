import { useEffect, useRef, useState } from "react";

export type Metric = {
  label: string;
  value: number;
  suffix?: string;
  /** 0..1 fill of the ring */
  norm: number;
  hue: number;
};

const METRICS: Metric[] = [
  { label: "Uptime", value: 99.98, suffix: "%", norm: 0.999, hue: 305 },
  { label: "Avg TPS", value: 19.9, suffix: "", norm: 0.96, hue: 320 },
  { label: "Network load", value: 61, suffix: "%", norm: 0.61, hue: 265 },
  { label: "NVMe IOPS", value: 940, suffix: "k", norm: 0.79, hue: 210 },
  { label: "Avg ping", value: 21, suffix: "ms", norm: 0.42, hue: 190 },
];

const TAU = Math.PI * 2;

/**
 * "Telemetry Orbit" — concentric live gauge rings with a rotating radar sweep,
 * an animated waveform core and hover inspection. Pure canvas, responsive.
 */
export function StatsOrbit({ metrics = METRICS }: { metrics?: Metric[] }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [active, setActive] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let t = 0;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const mouse = { x: -9999, y: -9999, inside: false };
    const grow = metrics.map(() => 0);
    const wave: number[] = new Array(120).fill(0.5);
    let hoverIdx = -1;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = Math.max(340, Math.min(560, rect.width * 0.62));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.inside = true;
    };
    const onLeave = () => {
      mouse.inside = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    const draw = () => {
      t += reduce ? 0 : 0.016;
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.54;
      const maxR = Math.min(w, h) * 0.42;
      const ringGap = maxR / (metrics.length + 1.6);

      // faint grid halo
      ctx.save();
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * TAU;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * maxR * 0.28, cy + Math.sin(a) * maxR * 0.28);
        ctx.lineTo(cx + Math.cos(a) * maxR * 1.06, cy + Math.sin(a) * maxR * 1.06);
        ctx.strokeStyle = `oklch(0.7 0.05 290 / ${i % 4 === 0 ? 0.09 : 0.035})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      // radar sweep
      const sweep = (t * 0.55) % TAU;
      const g = ctx.createConicGradient?.(sweep - 0.9, cx, cy);
      if (g) {
        g.addColorStop(0, "oklch(0.68 0.24 305 / 0)");
        g.addColorStop(0.12, "oklch(0.78 0.2 320 / 0.16)");
        g.addColorStop(0.16, "oklch(0.82 0.15 210 / 0)");
        g.addColorStop(1, "oklch(0.68 0.24 305 / 0)");
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * 1.06, 0, TAU);
        ctx.fillStyle = g;
        ctx.fill();
      }

      // hover detection by radius band
      const dx = mouse.x - cx;
      const dy = mouse.y - cy;
      const dist = Math.hypot(dx, dy);
      hoverIdx = -1;

      metrics.forEach((m, i) => {
        const r = maxR - i * ringGap;
        if (mouse.inside && Math.abs(dist - r) < ringGap * 0.48) hoverIdx = i;
      });

      metrics.forEach((m, i) => {
        const r = maxR - i * ringGap;
        const target = m.norm;
        grow[i] = (grow[i] ?? 0) + (target - (grow[i] ?? 0)) * (reduce ? 1 : 0.045);
        const hot = hoverIdx === i;
        const start = -Math.PI / 2;
        const end = start + TAU * (grow[i] ?? 0) * 0.82;

        // track
        ctx.beginPath();
        ctx.arc(cx, cy, r, start, start + TAU * 0.82);
        ctx.strokeStyle = "oklch(0.4 0.05 290 / 0.35)";
        ctx.lineWidth = hot ? 9 : 7;
        ctx.lineCap = "round";
        ctx.stroke();

        // value arc
        const lg = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
        lg.addColorStop(0, `oklch(0.62 0.22 ${m.hue})`);
        lg.addColorStop(1, `oklch(0.86 0.16 ${m.hue + 25})`);
        ctx.beginPath();
        ctx.arc(cx, cy, r, start, end);
        ctx.strokeStyle = lg;
        ctx.lineWidth = hot ? 10 : 7;
        ctx.shadowBlur = hot ? 26 : 14;
        ctx.shadowColor = `oklch(0.72 0.22 ${m.hue} / 0.75)`;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // head dot
        const hx = cx + Math.cos(end) * r;
        const hy = cy + Math.sin(end) * r;
        const pulse = 1 + Math.sin(t * 2.4 + i) * 0.18;
        ctx.beginPath();
        ctx.arc(hx, hy, (hot ? 6.5 : 4.5) * pulse, 0, TAU);
        ctx.fillStyle = `oklch(0.95 0.08 ${m.hue})`;
        ctx.shadowBlur = 18;
        ctx.shadowColor = `oklch(0.8 0.2 ${m.hue})`;
        ctx.fill();
        ctx.shadowBlur = 0;

        // (labels are rendered as HTML alongside the canvas to avoid overlap)

      });

      // waveform core
      wave.shift();
      const base = 0.5 + Math.sin(t * 1.7) * 0.12 + Math.sin(t * 4.3) * 0.06;
      wave.push(base + (Math.random() - 0.5) * 0.14);
      const coreR = maxR - metrics.length * ringGap - 6;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, TAU);
      ctx.clip();
      ctx.beginPath();
      wave.forEach((v, i) => {
        const x = cx - coreR + (i / (wave.length - 1)) * coreR * 2;
        const y = cy + (v - 0.5) * coreR * 1.1;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "oklch(0.82 0.15 210 / 0.9)";
      ctx.lineWidth = 1.6;
      ctx.shadowBlur = 14;
      ctx.shadowColor = "oklch(0.82 0.15 210 / 0.8)";
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, TAU);
      ctx.strokeStyle = "oklch(0.6 0.08 290 / 0.45)";
      ctx.lineWidth = 1;
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    const sync = window.setInterval(() => {
      setActive((a) => (hoverIdx >= 0 ? hoverIdx : (a + 1) % metrics.length));
    }, 400);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(sync);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [metrics]);

  const m = metrics[active] ?? metrics[0]!;

  return (
    <div
      ref={wrapRef}
      className="relative rounded-3xl border border-border bg-card/40 backdrop-blur overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <canvas ref={canvasRef} className="block w-full cursor-crosshair touch-none" />
      <div className="absolute left-6 top-6 w-[210px] max-w-[45%]">
        <div className="text-[10px] tracking-[0.3em] text-muted-foreground">LIVE TELEMETRY</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-3xl font-bold shimmer-text">
            {m.value}
            {m.suffix}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">{m.label}</div>

        <ul className="mt-6 space-y-1.5">
          {metrics.map((x, i) => (
            <li key={x.label}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="w-full flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5 text-left transition-all duration-300 hover:translate-x-1"
                style={{
                  borderColor: i === active ? `oklch(0.8 0.2 ${x.hue} / 0.6)` : "transparent",
                  background: i === active ? `oklch(0.8 0.2 ${x.hue} / 0.1)` : "transparent",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 transition-transform duration-300"
                  style={{
                    background: `oklch(0.8 0.2 ${x.hue})`,
                    transform: i === active ? "scale(1.9)" : "scale(1)",
                    boxShadow: i === active ? `0 0 12px oklch(0.8 0.2 ${x.hue})` : "none",
                  }}
                />
                <span
                  className="text-[11px] flex-1 truncate transition-colors"
                  style={{ color: i === active ? "var(--foreground)" : "var(--muted-foreground)" }}
                >
                  {x.label}
                </span>
                <span
                  className="text-[11px] font-mono tabular-nums transition-colors"
                  style={{ color: i === active ? `oklch(0.9 0.14 ${x.hue})` : "var(--muted-foreground)" }}
                >
                  {x.value}
                  {x.suffix}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
