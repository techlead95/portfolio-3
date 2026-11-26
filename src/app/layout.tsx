import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { profile } from "@/data/resume";
import { Providers } from "@/components/providers";
import { Intro } from "@/components/intro";
import { Cursor } from "@/components/cursor";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const serif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const title = `${profile.name} | ${profile.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(profile.website),
  title: { default: title, template: `%s | ${profile.name}` },
  description: profile.description,
  keywords: [
    "Luis Rasgado",
    "AI Engineer",
    "Applied AI",
    "Full Stack Engineer",
    "LLM",
    "RAG",
    "AI agents",
    "MCP",
    "LangGraph",
    "FastAPI",
    "Spring Boot",
    "React",
    "San Francisco",
  ],
  authors: [{ name: profile.name, url: profile.website }],
  creator: profile.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: profile.name,
    title,
    description: profile.description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title, description: profile.description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0d" },
  ],
  colorScheme: "light dark",
};

// Runs before first paint: applies the saved theme (no flash) and decides whether
// the intro curtain plays (first visit per session, never with reduced motion).
const bootScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")d.setAttribute("data-theme",t)}catch(e){}try{if(sessionStorage.getItem("intro")||matchMedia("(prefers-reduced-motion: reduce)").matches){d.setAttribute("data-intro","skip")}else{d.setAttribute("data-intro","play");sessionStorage.setItem("intro","1")}}catch(e){d.setAttribute("data-intro","skip")}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} ${serif.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-dvh bg-bg text-fg">
        <a
          href="#main"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <Intro />
        <Providers>
          {children}
          <Cursor />
        </Providers>
        <div
          aria-hidden
          className="noise pointer-events-none fixed inset-0 z-[90] opacity-[var(--grain-opacity)] mix-blend-overlay"
        />
      </body>
    </html>
  );
}
