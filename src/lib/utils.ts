export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Splits "plain **bold** plain" into segments. */
export function parseMarks(text: string, marker: "**" | "*") {
  const escaped = marker === "**" ? "\\*\\*" : "\\*";
  const re = new RegExp(`${escaped}(.+?)${escaped}`, "g");
  const out: { text: string; marked: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), marked: false });
    out.push({ text: m[1], marked: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), marked: false });
  return out;
}
