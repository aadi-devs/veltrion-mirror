import { useEffect, useMemo, useRef, useState } from "react";
import { loadNodes, NODES_EVENT, type NetworkNode } from "@/lib/nodes";

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

function toVec(lat: number, lon: number): Vec3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return {
    x: -Math.sin(phi) * Math.cos(theta),
    y: Math.cos(phi),
    z: Math.sin(phi) * Math.sin(theta),
  };
}

function rotate(v: Vec3, yaw: number, pitch: number): Vec3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = v.x * cy - v.z * sy;
  const z1 = v.x * sy + v.z * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return { x: x1, y: v.y * cp - z1 * sp, z: v.y * sp + z1 * cp };
}

const MIN_ZOOM = 0.7;
const MAX_ZOOM = 2.2;

export function NodeGlobe() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<NetworkNode[]>(() => loadNodes());
  const [hovered, setHovered] = useState<{ node: NetworkNode; x: number; y: number } | null>(null);

  const view = useRef({ yaw: 0.6, pitch: -0.35, zoom: 1, dragging: false, lastX: 0, lastY: 0, spin: true });
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const hoverRef = useRef<{ x: number; y: number } | null>(null);
  const setHoveredRef = useRef(setHovered);
  setHoveredRef.current = setHovered;

  useEffect(() => {
    setNodes(loadNodes());
    const onChange = () => setNodes(loadNodes());
    window.addEventListener(NODES_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(NODES_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const statusColor = useMemo(
    () => ({ online: "#22e0b8", maintenance: "#f5b74d", planned: "#9b7dff" }) as Record<string, string>,
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const draw = () => {
      const v = view.current;
      if (v.spin && !v.dragging) v.yaw += 0.0022;

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.42 * v.zoom;

      const project = (p: Vec3) => {
        const rp = rotate(p, v.yaw, v.pitch);
        return { x: cx + rp.x * r, y: cy - rp.y * r, z: rp.z };
      };

      // halo
      const grad = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.35);
      grad.addColorStop(0, "rgba(120,90,255,0.16)");
      grad.addColorStop(1, "rgba(120,90,255,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
      ctx.fill();

      const strokeLine = (pts: Vec3[]) => {
        for (let i = 0; i < pts.length - 1; i++) {
          const a = project(pts[i]!);
          const b = project(pts[i + 1]!);
          const depth = (a.z + b.z) / 2;
          const alpha = depth > 0 ? 0.34 : 0.11;
          ctx.strokeStyle = `rgba(150,190,255,${alpha})`;
          ctx.lineWidth = depth > 0 ? 1 : 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      };

      // parallels
      for (let lat = -75; lat <= 75; lat += 15) {
        const pts: Vec3[] = [];
        for (let lon = -180; lon <= 180; lon += 6) pts.push(toVec(lat, lon));
        strokeLine(pts);
      }
      // meridians
      for (let lon = -180; lon < 180; lon += 15) {
        const pts: Vec3[] = [];
        for (let lat = -90; lat <= 90; lat += 6) pts.push(toVec(lat, lon));
        strokeLine(pts);
      }

      // rim
      ctx.strokeStyle = "rgba(160,200,255,0.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // nodes
      const t = performance.now() / 1000;
      let nearest: { node: NetworkNode; x: number; y: number; d: number } | null = null;
      const projected = nodesRef.current.map((n) => ({ n, p: project(toVec(n.lat, n.lon)) }));

      // arcs between visible online nodes
      const visible = projected.filter((q) => q.p.z > 0 && q.n.status === "online");
      ctx.strokeStyle = "rgba(34,224,184,0.16)";
      ctx.lineWidth = 0.8;
      for (let i = 0; i < visible.length; i++) {
        for (let j = i + 1; j < visible.length; j++) {
          const a = visible[i]!.p;
          const b = visible[j]!.p;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo((a.x + b.x) / 2 + (cy - (a.y + b.y) / 2) * 0.05, (a.y + b.y) / 2 - r * 0.12, b.x, b.y);
          ctx.stroke();
        }
      }

      for (const { n, p } of projected) {
        const front = p.z > 0;
        const color = statusColor[n.status] ?? "#22e0b8";
        const pulse = 1 + Math.sin(t * 2 + p.x * 0.02) * 0.25;
        ctx.globalAlpha = front ? 1 : 0.25;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
        if (front) {
          ctx.globalAlpha = 0.22;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 7 * pulse, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        const m = hoverRef.current;
        if (front && m) {
          const d = Math.hypot(m.x - p.x, m.y - p.y);
          if (d < 16 && (!nearest || d < nearest.d)) nearest = { node: n, x: p.x, y: p.y, d };
        }
      }

      setHoveredRef.current(nearest ? { node: nearest.node, x: nearest.x, y: nearest.y } : null);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onPointerDown = (e: PointerEvent) => {
      view.current.dragging = true;
      view.current.lastX = e.clientX;
      view.current.lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      hoverRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const v = view.current;
      if (!v.dragging) return;
      v.yaw += (e.clientX - v.lastX) * 0.006;
      v.pitch = Math.max(-1.2, Math.min(1.2, v.pitch - (e.clientY - v.lastY) * 0.006));
      v.lastX = e.clientX;
      v.lastY = e.clientY;
    };
    const onPointerUp = (e: PointerEvent) => {
      view.current.dragging = false;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };
    const onLeave = () => {
      hoverRef.current = null;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      view.current.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, view.current.zoom * Math.exp(-dy * 0.0015)));
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [statusColor]);

  return (
    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
      <div
        ref={wrapRef}
        className="relative w-full aspect-square max-h-[520px] touch-none select-none"
        aria-label="Interactive wireframe globe showing Anuverse node locations"
      >
        <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        {hovered && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-card/90 backdrop-blur px-3 py-2 text-xs shadow-lg"
            style={{ left: hovered.x, top: hovered.y - 10 }}
          >
            <div className="font-semibold">{hovered.node.city}</div>
            <div className="text-muted-foreground">
              {hovered.node.country} · {hovered.node.status}
            </div>
          </div>
        )}
        <p className="absolute bottom-0 inset-x-0 text-center text-xs text-muted-foreground">
          Drag to rotate · scroll to zoom
        </p>
      </div>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {nodes.map((n) => (
          <li
            key={n.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/40 backdrop-blur px-4 py-3"
          >
            <div>
              <div className="font-medium text-sm">{n.city}</div>
              <div className="text-xs text-muted-foreground">{n.country}</div>
            </div>
            <span
              className="text-[11px] uppercase tracking-wide font-semibold"
              style={{ color: statusColor[n.status] }}
            >
              {n.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NodeGlobe;
