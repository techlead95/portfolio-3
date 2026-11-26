"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import "lenis/dist/lenis.css";
import { EASE_OUT } from "@/lib/utils";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: EASE_OUT }}>
      {/* Lenis honours prefers-reduced-motion by default */}
      <ReactLenis root options={{ lerp: 0.1, anchors: true, stopInertiaOnNavigate: true }} />
      {children}
    </MotionConfig>
  );
}
