# Luis Rasgado | Portfolio

Animated personal site for a Senior AI & Full Stack Engineer.

**Stack:** Next.js 16 (App Router, Turbopack, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · Motion · Lenis smooth scroll · View Transitions API (theme switch) · `next/og` social image.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # fully static output
```

## Edit content

All copy, headline metrics, experience, and skills live in
[`src/data/resume.ts`](src/data/resume.ts). Wrap text in `**double asterisks**` to bold it.
The downloadable résumé is `public/Luis_Rasgado_Resume.pdf`.

## Structure

- `src/components/hero/`: hero, 3D signal field (swells, tool signals, cursor lift, click ripples), animated agent trace
- `src/components/sections/`: Impact (key metrics), Experience, Skills, Contact
- `src/components/ui/`: reveal, split-text, counter, magnetic, spotlight
- `src/app/`: layout & metadata, OG image, icon, sitemap, robots

## Motion

Intro curtain (once per session, CSS-only), blend-mode custom cursor, scramble-decoded labels,
hero parallax with springy hover letters, 3D signal field (swells, tool signals, cursor lift, click ripples), a scroll-lit summary statement,
a scroll-velocity marquee that surges and skews, 3D flip-in impact cards with animated before/after
charts, odometer digits, sticky experience cards that stack and recede, highlighter sweeps on
results, a rotating closing word, a footer name that rises letter by letter, and a View Transitions
theme switch. Everything respects `prefers-reduced-motion`.

## AI chat ("Ask my AI")

A floating assistant answers visitors' questions about the résumé, streaming replies from Claude
(`claude-opus-5-5`, low effort). Its knowledge is built from `src/data/resume.ts`, so it stays in sync
with the site, and it is told not to guess beyond those facts.

1. Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`.
2. Restart `npm run dev` (env files are read at startup).

**Rate limits** (in `src/lib/rate-limit.ts`, configurable in `.env.local`):

| Variable | Default | Meaning |
| --- | --- | --- |
| `CHAT_LIMIT_PER_10_MIN` | 8 | Messages one visitor can send per 10 minutes |
| `CHAT_LIMIT_PER_DAY` | 30 | Messages one visitor can send per day |
| `CHAT_GLOBAL_DAILY_LIMIT` | 500 | Messages all visitors together can send per day (caps API spend) |

Requests are also capped at 500 characters per question and the last 12 messages of history,
2,048 output tokens per answer, and only accepted from the site's own pages.
Limits are kept in server memory: right for one Node server (`next start`, VPS, container). On
serverless or multi-instance hosting, back `store` in `rate-limit.ts` with Redis/Upstash so every
instance shares the counters.
