import { useEffect, useRef } from "react";

/**
 * Interactive hero backdrop: a warping wireframe terrain grid made of
 * "data packets" travelling along it. Reacts to pointer movement and
 * is fully responsive. No images — pure canvas.
 */
export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: false };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const COLS = 34;
    const ROWS = 20;

    type Packet = { col: number; row: number; t: number; speed: number };
    const packets: Packet[] = Array.from({ length: 26 }, () => ({
      col: Math.floor(Math.random() * COLS),
      row: Math.floor(Math.random() * ROWS),
      t: Math.random(),
      speed: 0.12 + Math.random() * 0.35,
    }));

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.2,
      p: Math.random() * Math.PI * 2,
    }));

    // Perspective projection of a grid point
    const project = (cx: number, cy: number, time: number) => {
      // normalized -1..1
      const u = (cx / (COLS - 1)) * 2 - 1;
      const v = cy / (ROWS - 1);
      const depth = 0.28 + v * 1.5;
      const wave =
        Math.sin(u * 3 + time * 0.7) * 12 +
        Math.sin(v * 7 - time * 1.1) * 8 +
        Math.cos((u + v) * 5 + time * 0.5) * 6;
      // pointer parallax
      const px = (pointer.x - 0.5) * 90;
      const py = (pointer.y - 0.5) * 40;
      const horizon = h * 0.42;
      const x = w / 2 + (u * w * 0.85 * depth) / 1.6 - px * (1 - v) * 0.6;
      const y = horizon + (v * v * h * 0.78) + wave * (0.4 + v) - py * (1 - v) * 0.4;
      return { x, y, depth, v };
    };

    let start = performance.now();
    const draw = (now: number) => {
      const time = (now - start) / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      ctx.clearRect(0, 0, w, h);

      // Aurora glow
      const g = ctx.createRadialGradient(
        w * (0.5 + (pointer.x - 0.5) * 0.25),
        h * 0.38,
        0,
        w * 0.5,
        h * 0.4,
        Math.max(w, h) * 0.75,
      );
      g.addColorStop(0, "oklch(0.68 0.24 305 / 0.35)");
      g.addColorStop(0.45, "oklch(0.5 0.2 280 / 0.14)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const g2 = ctx.createRadialGradient(w * 0.15, h * 0.2, 0, w * 0.15, h * 0.2, w * 0.5);
      g2.addColorStop(0, "oklch(0.82 0.15 210 / 0.18)");
      g2.addColorStop(1, "transparent");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      // Stars above horizon
      for (const s of stars) {
        const sy = s.y * h * 0.45;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 1.6 + s.p));
        ctx.globalAlpha = tw * 0.7;
        ctx.fillStyle = "oklch(0.95 0.03 300)";
        ctx.beginPath();
        ctx.arc(s.x * w + (pointer.x - 0.5) * -20, sy + (pointer.y - 0.5) * -10, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Grid lines
      ctx.lineWidth = 1;
      for (let r = 0; r < ROWS; r++) {
        ctx.beginPath();
        for (let c = 0; c < COLS; c++) {
          const p = project(c, r, time);
          if (c === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        const a = 0.06 + (r / ROWS) * 0.5;
        ctx.strokeStyle = `oklch(0.78 0.2 320 / ${a.toFixed(3)})`;
        ctx.stroke();
      }
      for (let c = 0; c < COLS; c++) {
        ctx.beginPath();
        for (let r = 0; r < ROWS; r++) {
          const p = project(c, r, time);
          if (r === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        const a = 0.04 + Math.abs(Math.sin(c * 0.4 + time * 0.3)) * 0.22;
        ctx.strokeStyle = `oklch(0.82 0.15 210 / ${a.toFixed(3)})`;
        ctx.stroke();
      }

      // Travelling data packets along rows
      for (const pk of packets) {
        pk.t += pk.speed * 0.006;
        if (pk.t > 1) {
          pk.t = 0;
          pk.col = Math.floor(Math.random() * COLS);
          pk.row = Math.floor(Math.random() * ROWS);
        }
        const c = pk.t * (COLS - 1);
        const p = project(c, pk.row, time);
        const size = 1.5 + p.v * 3.5;
        ctx.beginPath();
        ctx.fillStyle = "oklch(0.9 0.16 210)";
        ctx.shadowBlur = 16;
        ctx.shadowColor = "oklch(0.82 0.15 210 / 0.9)";
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = (e.clientX - rect.left) / rect.width;
      pointer.ty = (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" aria-hidden="true" />;
}
