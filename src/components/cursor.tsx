"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const QUERY = "(pointer: fine) and (prefers-reduced-motion: no-preference)";
const INTERACTIVE = "a, button, [role='tab'], [data-cursor]";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

type Mode = "hidden" | "idle" | "hover" | "down";

/** Blend-mode cursor: exact dot + springy ring that swells over interactive elements. */
export function Cursor() {
  const enabled = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
  return enabled ? <CursorInner /> : null;
}

function CursorInner() {
  const [mode, setMode] = useState<Mode>("hidden");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 420, damping: 32, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 420, damping: 32, mass: 0.5 });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("has-cursor");
    let hovering = false;
    let down = false;
    const sync = () => setMode(down ? "down" : hovering ? "hover" : "idle");

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      const next = Boolean((e.target as Element | null)?.closest?.(INTERACTIVE));
      if (next !== hovering) hovering = next;
      sync();
    };
    const onDown = () => {
      down = true;
      sync();
    };
    const onUp = () => {
      down = false;
      sync();
    };
    const onLeave = () => setMode("hidden");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [x, y]);

  const ring = {
    hidden: { scale: 0, opacity: 0 },
    idle: { scale: 1, opacity: 1, backgroundColor: "rgba(255,255,255,0)" },
    hover: { scale: 1.9, opacity: 1, backgroundColor: "rgba(255,255,255,1)" },
    down: { scale: 0.75, opacity: 1, backgroundColor: "rgba(255,255,255,1)" },
  };

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[95] mix-blend-difference">
      <motion.div
        className="absolute left-0 top-0 -ml-[18px] -mt-[18px] size-9 rounded-full border border-white"
        style={{ x: rx, y: ry }}
        variants={ring}
        initial="hidden"
        animate={mode}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
      />
      <motion.div
        className="absolute left-0 top-0 -ml-[3px] -mt-[3px] size-1.5 rounded-full bg-white"
        style={{ x, y }}
        animate={{ opacity: mode === "hidden" || mode === "hover" ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
    </div>
  );
}
