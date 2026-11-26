/** Seconds (from navigation start) when the intro curtain has revealed the hero. */
const INTRO_REVEAL_AT = 1.45;

let cached: number | null = null;

/**
 * Extra delay for hero entrance animations so they start as the intro curtain lifts.
 * 0 on the server, on repeat visits, and when the intro is skipped.
 */
export function introDelay() {
  if (typeof document === "undefined") return 0;
  if (cached === null) {
    cached =
      document.documentElement.dataset.intro === "play"
        ? Math.max(0, INTRO_REVEAL_AT - performance.now() / 1000)
        : 0;
  }
  return cached;
}
