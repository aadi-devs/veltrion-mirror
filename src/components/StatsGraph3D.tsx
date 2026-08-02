import { useEffect, useRef, useState } from "react";

export type StatBar = {
  label: string;
  value: number;
  suffix?: string;
  /** 0..1 normalized height */
  norm: number;
};

const DEFAULT_BARS: StatBar[] = [
  { label: "Uptime", value: 99.98, suffix: "%", norm: 1 },
  { label: "Avg TPS", value: 19.9, suffix: "", norm: 0.96 },
  { label: "Nodes", value: 24, suffix: "", norm: 0.62 },
  { label: "Servers", value: 4820, suffix: "", norm: 0.88 },
  { label: "Avg Ping", value: 21, suffix: "ms", norm: 0.42 },
  { label: "Tickets/hr", value: 37, suffix: "", norm: 0.55 },
  { label: "NVMe IOPS", value: 940, suffix: "k", norm: 0.79 },
];

/**
 * Fully animated, interactive 3D bar graph of hosting stats.
 * Drag to orbit, scroll to zoom, hover a bar to inspect. Pure canvas —
 * isometric/perspective projection with depth sorting.
 */
export function StatsGraph3D({ bars = DEFAULT_BARS }: { bars?: StatBar[] }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hover, setHover] = useState<StatBar | null>(null);
  const [tip, setTip] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const state = {
      yaw: -0.6,
      pitch: 0.55,
      targetYaw: -0.6,
      targetPitch: 0.55,
      zoom: 1,
      targetZoom: 1,
      dragging: false,
      lastX: 0,
      lastY: 0,
      grow: 0,
      hoverIdx: -1,
      mouse: { x: -1, y: -1 },
      autoSpin: true,
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const n = bars.length;
    const spacing = 1.35;
    const barW = 0.5;
    const maxH = 3.2;

    const project = (x: number, y: number, z: number) => {
      const cy = Math.cos(state.yaw);
      const sy = Math.sin(state.yaw);
      const cp = Math.cos(state.pitch);
      const sp = Math.sin(state.pitch);
      let X = x * cy - z * sy;
      let Z = x * sy + z * cy;
      let Y = y * cp - Z * sp;
      Z = y * sp + Z * cp;
      const d = 12;
      const scale = (Math.min(w, h) / 7) * state.zoom * (d / (d + Z));
      return { x: w / 2 + X * scale, y: h / 2 + 40 - Y * scale, z: Z };
    };

    type Face = { pts: { x: number; y: number }[]; z: number; fill: string; stroke?: string };

    const draw = (now: number) => {
      const t = now / 1000;
      if (state.autoSpin && !state.dragging) state.targetYaw += 0.0022;
      state.yaw += (state.targetYaw - state.yaw) * 0.09;
      state.pitch += (state.targetPitch - state.pitch) * 0.09;
      state.zoom += (state.targetZoom - state.zoom) * 0.1;
      state.grow += (1 - state.grow) * 0.035;

      ctx.clearRect(0, 0, w, h);

      const faces: Face[] = [];

      // Floor grid
      const half = (n * spacing) / 2;
      for (let i = -3; i <= 3; i++) {
        const a = project(-half - 0.4, 0, i * 0.9);
        const b = project(half + 0.4, 0, i * 0.9);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = "oklch(0.78 0.2 320 / 0.14)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      for (let i = 0; i <= n; i++) {
        const x = -half + i * spacing;
        const a = project(x, 0, -2.7);
        const b = project(x, 0, 2.7);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = "oklch(0.82 0.15 210 / 0.12)";
        ctx.stroke();
      }

      const hitBoxes: { idx: number; x: number; y: number; r: number }[] = [];

      bars.forEach((bar, i) => {
        const cx = -half + spacing * (i + 0.5);
        const pulse = 1 + Math.sin(t * 1.6 + i) * 0.035;
        const hgt = bar.norm * maxH * state.grow * pulse * (state.hoverIdx === i ? 1.08 : 1);
        const hw = barW / 2;
        const cz = 0;

        const corners = [
          [cx - hw, 0, cz - hw],
          [cx + hw, 0, cz - hw],
          [cx + hw, 0, cz + hw],
          [cx - hw, 0, cz + hw],
          [cx - hw, hgt, cz - hw],
          [cx + hw, hgt, cz - hw],
          [cx + hw, hgt, cz + hw],
          [cx - hw, hgt, cz + hw],
        ].map(([x, y, z]) => project(x!, y!, z!));

        const top = project(cx, hgt, cz);
        hitBoxes.push({ idx: i, x: top.x, y: top.y, r: Math.max(26, 34 * state.zoom) });

        const hot = state.hoverIdx === i;
        const quads: [number[], string][] = [
          [[0, 1, 5, 4], hot ? "oklch(0.62 0.24 305 / 0.95)" : "oklch(0.48 0.2 300 / 0.85)"],
          [[1, 2, 6, 5], hot ? "oklch(0.72 0.2 320 / 0.95)" : "oklch(0.56 0.18 315 / 0.85)"],
          [[3, 2, 6, 7], hot ? "oklch(0.5 0.2 295 / 0.9)" : "oklch(0.38 0.16 292 / 0.8)"],
          [[0, 3, 7, 4], hot ? "oklch(0.44 0.18 290 / 0.9)" : "oklch(0.34 0.14 288 / 0.8)"],
          [[4, 5, 6, 7], hot ? "oklch(0.9 0.16 210)" : "oklch(0.82 0.15 210 / 0.92)"],
        ];
        for (const [idxs, fill] of quads) {
          const pts = idxs.map((k) => corners[k]!);
          const z = pts.reduce((s, p) => s + p.z, 0) / pts.length;
          faces.push({ pts, z, fill, stroke: "oklch(0.9 0.1 300 / 0.35)" });
        }

        // reflection
        const rTop = project(cx, -hgt * 0.5, cz);
        faces.push({
          pts: [corners[0]!, corners[1]!, { x: corners[1]!.x, y: rTop.y }, { x: corners[0]!.x, y: rTop.y }],
          z: -99,
          fill: "oklch(0.6 0.2 305 / 0.07)",
        });
      });

      faces.sort((a, b) => b.z - a.z);
      for (const f of faces) {
        ctx.beginPath();
        ctx.moveTo(f.pts[0]!.x, f.pts[0]!.y);
        for (let i = 1; i < f.pts.length; i++) ctx.lineTo(f.pts[i]!.x, f.pts[i]!.y);
        ctx.closePath();
        ctx.fillStyle = f.fill;
        ctx.fill();
        if (f.stroke) {
          ctx.strokeStyle = f.stroke;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Labels + values
      ctx.textAlign = "center";
      bars.forEach((bar, i) => {
        const cx = -half + spacing * (i + 0.5);
        const base = project(cx, -0.35, 0.8);
        const hgt = bar.norm * maxH * state.grow;
        const top = project(cx, hgt + 0.35, 0);
        const hot = state.hoverIdx === i;
        ctx.font = `${hot ? "600 " : ""}${Math.max(9, 11 * state.zoom)}px "Space Grotesk", sans-serif`;
        ctx.fillStyle = hot ? "oklch(0.95 0.05 300)" : "oklch(0.72 0.03 285)";
        ctx.fillText(bar.label, base.x, base.y);
        const shown = (bar.value * state.grow).toFixed(bar.value % 1 === 0 ? 0 : 2);
        ctx.font = `600 ${Math.max(10, 13 * state.zoom)}px "Space Grotesk", sans-serif`;
        ctx.fillStyle = "oklch(0.9 0.16 210)";
        ctx.fillText(`${shown}${bar.suffix ?? ""}`, top.x, top.y);
      });

      // hover detection
      let found = -1;
      if (state.mouse.x >= 0) {
        let best = Infinity;
        for (const hb of hitBoxes) {
          const d = Math.hypot(hb.x - state.mouse.x, hb.y - state.mouse.y);
          if (d < hb.r && d < best) {
            best = d;
            found = hb.idx;
          }
        }
      }
      if (found !== state.hoverIdx) {
        state.hoverIdx = found;
        setHover(found >= 0 ? bars[found]! : null);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e: PointerEvent) => {
      state.dragging = true;
      state.autoSpin = false;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = () => {
      state.dragging = false;
      window.setTimeout(() => (state.autoSpin = true), 2500);
    };
    const onMove = (e: PointerEvent) => {
      const p = pos(e);
      state.mouse = p;
      setTip(p);
      if (!state.dragging) return;
      state.targetYaw += (e.clientX - state.lastX) * 0.008;
      state.targetPitch = Math.max(0.12, Math.min(1.2, state.targetPitch + (e.clientY - state.lastY) * 0.005));
      state.lastX = e.clientX;
      state.lastY = e.clientY;
    };
    const onLeave = () => {
      state.mouse = { x: -1, y: -1 };
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      state.targetZoom = Math.max(0.6, Math.min(2.2, state.targetZoom - e.deltaY * 0.0012));
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [bars]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full rounded-3xl border border-border bg-card/40 backdrop-blur overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-[380px] md:h-[520px] cursor-grab active:cursor-grabbing touch-none"
      />
      {hover && (
        <div
          className="pointer-events-none absolute px-3 py-2 rounded-xl text-xs border border-border bg-popover/90 backdrop-blur shadow-lg"
          style={{ left: Math.min(tip.x + 14, 9999), top: tip.y + 14 }}
        >
          <div className="font-semibold">{hover.label}</div>
          <div className="text-muted-foreground">
            {hover.value}
            {hover.suffix ?? ""}
          </div>
        </div>
      )}
      <div className="absolute bottom-3 left-4 text-[11px] text-muted-foreground">
        Drag to orbit · scroll to zoom · hover a bar
      </div>
      <span className="absolute top-3 right-4 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: "var(--accent-cyan)" }} />
        live
      </span>
    </div>
  );
}
