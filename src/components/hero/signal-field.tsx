"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A perspective "signal field": a plane of dots receding to a horizon,
 * rolling in slow swells. Every few seconds a signal ripples out from one
 * of the tools Luis ships with; the cursor lifts and lights the field, and
 * a click sends a ripple of your own. Pauses off-screen, honours reduced
 * motion, and re-reads colours when the theme changes.
 */

type Ripple = { x: number; z: number; t0: number; label?: string; strong: boolean };

const LABELS = ["RAG", "Kafka", "Claude", "Spring Boot", "MCP", "FastAPI", "React", "Pinecone", "LangGraph", "Java 21"];
const CAM_H = 1.15; // camera height above the plane
const Z_NEAR = 1.7;
const Z_FAR = 13;
const X_SPAN = 7.5;
const RIPPLE_SPEED = 2.6; // world units per second
const RIPPLE_LIFE = 4.2; // seconds
const AUTO_EVERY = 2600; // ms between automatic signals

export function SignalField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let f = 1; // focal length in px
    let horizon = 0;
    let cols = 0;
    let rows = 0;
    let raf = 0;
    let visible = true;
    let lastAuto = -AUTO_EVERY;
    let labelIdx = 0;
    let ripples: Ripple[] = [];
    let born = -1; // first frame time, for the fade-in
    const mouse = { sx: -1, sy: -1, x: 0, z: 0, on: false, glow: 0 };
    let colors = readColors();

    function readColors() {
      const s = getComputedStyle(document.documentElement);
      return {
        fg: s.getPropertyValue("--fg").trim() || "#ecedee",
        accent: s.getPropertyValue("--accent-text").trim() || "#c8f560",
        subtle: s.getPropertyValue("--subtle").trim() || "#6b7177",
        mono: s.getPropertyValue("--font-geist-mono").trim() || "monospace",
      };
    }

    function init() {
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const small = w < 700;
      // Frame the field to the first screen, even when the hero is taller.
      const vh = Math.min(h, window.innerHeight);
      f = Math.max(w, vh * 1.1) * (small ? 0.62 : 0.5);
      horizon = vh * (small ? 0.42 : 0.3);
      cols = small ? 56 : 120;
      rows = small ? 44 : 64;
    }

    /** Screen point on the ground plane (y = 0) → world (x, z). */
    function unproject(sx: number, sy: number) {
      if (sy <= horizon + 2) return null;
      const z = (CAM_H * f) / (sy - horizon);
      return { x: ((sx - w / 2) * z) / f, z };
    }

    function spawn(x: number, z: number, t: number, strong: boolean, label?: string) {
      ripples.push({ x, z, t0: t, label, strong });
      if (ripples.length > 7) ripples.shift();
    }

    function draw(now: number) {
      const t = now / 1000;
      if (born < 0) born = now;
      // Fade in with the hero text instead of popping in fully formed.
      const intro = reduce ? 1 : Math.min(1, Math.max(0, (now - born - 500) / 1800));
      ctx!.clearRect(0, 0, w, h);
      if (intro <= 0) return;

      // Soft haze sitting on the horizon.
      const haze = ctx!.createRadialGradient(w / 2, horizon, 0, w / 2, horizon, Math.max(w * 0.45, 220));
      haze.addColorStop(0, colors.accent);
      haze.addColorStop(1, "transparent");
      ctx!.save();
      ctx!.globalAlpha = 0.07 * intro;
      ctx!.setTransform(dpr, 0, 0, dpr * 0.28, 0, horizon * dpr * 0.72);
      ctx!.fillStyle = haze;
      ctx!.fillRect(0, 0, w, h * 4);
      ctx!.restore();

      // Automatic signals from a named tool somewhere in the field.
      if (!reduce && now - lastAuto > AUTO_EVERY) {
        lastAuto = now;
        const x = (Math.random() - 0.5) * 6;
        const z = 3 + Math.random() * 6;
        spawn(x, z, t, false, LABELS[labelIdx++ % LABELS.length]);
      }
      ripples = ripples.filter((r) => t - r.t0 < RIPPLE_LIFE);

      // Cursor glow eases in and out.
      mouse.glow += ((mouse.on ? 1 : 0) - mouse.glow) * 0.08;

      for (let j = 0; j < rows; j++) {
        // Rows spaced so they look even in perspective.
        const u = j / (rows - 1);
        const z = Z_FAR - (Z_FAR - Z_NEAR) * Math.pow(u, 0.85);
        const depth = 1 - (z - Z_NEAR) / (Z_FAR - Z_NEAR); // 0 far → 1 near
        const k = f / z;

        for (let i = 0; i < cols; i++) {
          const x = (i / (cols - 1) - 0.5) * 2 * X_SPAN;
          const sx = w / 2 + x * k;
          if (sx < -20 || sx > w + 20) continue;

          // Swells.
          let y =
            0.16 * Math.sin(x * 0.75 + t * 0.55) * Math.cos(z * 0.6 - t * 0.35) +
            0.07 * Math.sin((x * 0.9 + z * 1.4) - t * 1.05);
          let lit = Math.max(0, y - 0.08) * 3;

          // Signals.
          for (const r of ripples) {
            const age = t - r.t0;
            const d = Math.hypot(x - r.x, z - r.z);
            const band = d - age * RIPPLE_SPEED;
            const life = 1 - age / RIPPLE_LIFE;
            const g = Math.exp(-(band * band) / 0.18) * life * (r.strong ? 1.3 : 1);
            y += 0.22 * g;
            lit += g * 1.4;
          }

          // Cursor: a soft lift with a lit halo.
          if (mouse.glow > 0.01) {
            const d2 = (x - mouse.x) ** 2 + ((z - mouse.z) * 1.4) ** 2;
            const g = Math.exp(-d2 / 0.9) * mouse.glow;
            y += 0.32 * g;
            lit += g * 1.6;
          }

          const sy = horizon + (CAM_H - y) * k;
          if (sy < -10 || sy > h + 10) continue;

          // Nearest rows recede so the field stays calm behind text.
          // ...and the farthest rows melt into the horizon instead of forming an edge.
          const near = (depth > 0.7 ? 1 - ((depth - 0.7) / 0.3) * 0.55 : 1) * Math.min(1, depth / 0.25);
          const size = 0.6 + depth * 1.3;
          const base = (0.05 + depth * 0.22) * near;
          const glow = Math.min(1, lit);

          if (glow > 0.2) {
            ctx!.fillStyle = colors.accent;
            ctx!.globalAlpha = Math.min(0.85, base + glow * 0.6) * near * intro;
            const s = size * (1 + glow * 0.45);
            ctx!.fillRect(sx - s / 2, sy - s / 2, s, s);
          } else {
            ctx!.fillStyle = colors.fg;
            ctx!.globalAlpha = base * intro;
            ctx!.fillRect(sx - size / 2, sy - size / 2, size, size);
          }
        }
      }

      // Labels at signal origins, fading as the ring spreads.
      ctx!.font = `500 11px ${colors.mono}`;
      ctx!.textAlign = "center";
      for (const r of ripples) {
        if (!r.label) continue;
        const age = t - r.t0;
        const k = f / r.z;
        const sx = w / 2 + r.x * k;
        const sy = horizon + CAM_H * k;
        const a = Math.min(1, age * 3) * Math.max(0, 1 - age / (RIPPLE_LIFE * 0.7));
        ctx!.globalAlpha = a * 0.9 * intro;
        ctx!.fillStyle = colors.accent;
        ctx!.beginPath();
        ctx!.arc(sx, sy - 0.22 * k * 0.4, 2.5, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.globalAlpha = a * 0.75 * intro;
        ctx!.fillStyle = colors.subtle;
        ctx!.fillText(r.label, sx, sy - 14 - age * 6);
      }
      ctx!.globalAlpha = 1;
    }

    function loop(now: number) {
      draw(now);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      cancelAnimationFrame(raf);
      if (reduce) {
        draw(4000);
        return;
      }
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    }

    init();
    start();

    const ro = new ResizeObserver(() => {
      init();
      start();
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    });
    io.observe(canvas);

    const mo = new MutationObserver(() => {
      colors = readColors();
      if (reduce) draw(4000);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      const p = unproject(e.clientX - r.left, e.clientY - r.top);
      mouse.on = !!p && e.clientY >= r.top && e.clientY <= r.bottom;
      if (p) {
        mouse.x = p.x;
        mouse.z = p.z;
      }
    };
    const onDown = (e: PointerEvent) => {
      if (reduce) return;
      const r = canvas.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      const p = unproject(e.clientX - r.left, e.clientY - r.top);
      if (p) spawn(p.x, p.z, performance.now() / 1000, true);
    };
    const onLeave = () => {
      mouse.on = false;
    };
    const onVisibility = () => start();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={cn("pointer-events-none block h-full w-full", className)} />;
}
