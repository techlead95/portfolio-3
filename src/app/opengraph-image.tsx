import { ImageResponse } from "next/og";
import { profile } from "@/data/resume";

export const alt = `${profile.name} | ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const stats = [
    { v: "$200K/yr", k: "LLM savings" },
    { v: "<30s", k: "course discovery" },
    { v: "99.99%", k: "uptime SLA" },
    { v: "11+ yrs", k: "shipping software" },
  ];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0a0b0d",
          backgroundImage:
            "radial-gradient(circle at 85% 10%, rgba(200,245,96,0.18), transparent 45%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 72px 72px, 72px 72px",
          color: "#ecedee",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, color: "#a0a6ab", letterSpacing: 3 }}>
          <div style={{ width: 14, height: 14, borderRadius: 99, background: "#c8f560" }} />
          {profile.role.toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 132, fontWeight: 700, letterSpacing: -6, lineHeight: 1 }}>{profile.name}</div>
          <div style={{ marginTop: 24, fontSize: 34, color: "#a0a6ab", maxWidth: 940, lineHeight: 1.3 }}>
            Full stack across Java, Python, and React. Bringing production AI to enterprise systems.
          </div>
        </div>
        <div style={{ display: "flex", gap: 56 }}>
          {stats.map((s) => (
            <div key={s.k} style={{ display: "flex", flexDirection: "column", borderLeft: "2px solid #2a2d31", paddingLeft: 20 }}>
              <div style={{ fontSize: 40, fontWeight: 700, color: "#c8f560" }}>{s.v}</div>
              <div style={{ fontSize: 20, color: "#6b7177", marginTop: 4 }}>{s.k}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
