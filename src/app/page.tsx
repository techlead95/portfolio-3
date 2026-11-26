import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero/hero";
import { Statement } from "@/components/sections/statement";
import { Impact } from "@/components/sections/impact";
import { Experience } from "@/components/sections/experience";
import { Skills } from "@/components/sections/skills";
import { Contact } from "@/components/sections/contact";
import { ChatWidget } from "@/components/chat/chat-widget";
import { education, profile, skills } from "@/data/resume";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  url: profile.website,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "San Francisco", addressRegion: "CA", addressCountry: "US" },
  alumniOf: { "@type": "CollegeOrUniversity", name: education.school },
  knowsAbout: skills.flatMap((s) => s.items).slice(0, 30),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Nav />
      <main id="main">
        <Hero />
        <Statement />
        <Impact />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <ChatWidget />
    </>
  );
}
