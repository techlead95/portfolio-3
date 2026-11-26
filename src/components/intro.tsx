import { profile } from "@/data/resume";

/**
 * Intro curtain: a CSS-only counter + layered wipe that plays on the first visit
 * of a session. Pure CSS so it runs before hydration and never blocks the page;
 * hidden instantly on repeat visits and for reduced-motion users (see boot script).
 */
export function Intro() {
  return (
    <div aria-hidden className="intro pointer-events-none fixed inset-0 z-[100]">
      <div className="intro-layer intro-layer--accent absolute inset-0 bg-accent" />
      <div className="intro-layer intro-layer--main absolute inset-0 flex flex-col justify-between bg-bg p-6 sm:p-10">
        <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
          <span>{profile.name}</span>
          <span>Portfolio</span>
        </div>
        <div>
          <div className="flex items-end justify-between gap-6">
            <span className="intro-count font-semibold leading-[0.8] tracking-[-0.06em] text-[clamp(5rem,20vw,15rem)] tabular-nums" />
            <span className="intro-role hidden pb-3 font-serif text-3xl italic text-muted sm:block">{profile.role}</span>
          </div>
          <div className="mt-6 h-px w-full bg-line">
            <div className="intro-bar h-full w-full origin-left bg-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}
