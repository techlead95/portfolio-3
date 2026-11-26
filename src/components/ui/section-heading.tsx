import { Reveal, ScrambleText, SplitWords } from "./motion-primitives";

export function SectionHeading({ index, label, title }: { index: string; label: string; title: string }) {
  return (
    <div>
      <Reveal y={12} blur={false}>
        <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-subtle">
          <span className="text-accent-text">{index}</span>
          <span className="h-px w-8 bg-line-strong" />
          <ScrambleText text={label} delay={0.15} speed={60} />
        </p>
      </Reveal>
      <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-5xl">
        <SplitWords text={title} />
      </h2>
    </div>
  );
}
