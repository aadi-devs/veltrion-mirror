import type { ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** direction of entry */
  from?: "up" | "down" | "left" | "right" | "scale";
};

const offsets: Record<NonNullable<Props["from"]>, string> = {
  up: "translate3d(0, 34px, 0)",
  down: "translate3d(0, -34px, 0)",
  left: "translate3d(-40px, 0, 0)",
  right: "translate3d(40px, 0, 0)",
  scale: "scale(0.94)",
};

export function Reveal({ children, delay = 0, className, from = "up" }: Props) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : offsets[from],
        filter: shown ? "blur(0px)" : "blur(6px)",
        transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, filter 0.8s ease ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
