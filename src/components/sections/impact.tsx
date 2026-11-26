"use client";

import { motion } from "motion/react";
import { impact } from "@/data/resume";
import { EASE_OUT } from "@/lib/utils";
import { SectionHeading } from "../ui/section-heading";
import { RollingNumber, SpotlightCard, Tilt } from "../ui/motion-primitives";
import { ImpactViz } from "./impact-viz";

export function Impact() {
  return (
    <section id="impact" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <SectionHeading index="01" label="Impact" title="Six numbers *worth remembering.*" />

      <div className="mt-10 grid gap-4 [perspective:1400px] sm:grid-cols-2 lg:grid-cols-3">
        {impact.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 70, rotateX: 28, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 1.1, delay: (i % 3) * 0.1, ease: EASE_OUT }}
            style={{ transformOrigin: "50% 100%" }}
          >
            <Tilt className="h-full" max={5}>
              <SpotlightCard className="flex h-full flex-col p-6 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{m.label}</span>
                  <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                    {m.where}
                  </span>
                </div>
                <p className="mt-5 flex flex-wrap items-end gap-x-3 text-6xl font-semibold tracking-[-0.05em] sm:text-7xl">
                  <RollingNumber
                    value={m.value}
                    prefix={m.prefix}
                    suffix={m.suffix}
                    decimals={m.decimals}
                    className="text-accent-text"
                  />
                  {m.unit && <span className="pb-1 font-mono text-sm font-normal tracking-normal text-subtle">{m.unit}</span>}
                </p>
                <p className="mt-3 text-pretty text-[15px] leading-relaxed text-muted">{m.text}</p>
                <div className="mt-auto pt-6">
                  <div className="border-t border-dashed border-line pt-5">
                    <ImpactViz viz={m.viz} />
                  </div>
                </div>
              </SpotlightCard>
            </Tilt>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
