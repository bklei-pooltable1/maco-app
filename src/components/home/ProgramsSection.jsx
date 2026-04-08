import weeklyServicesImg from "../../assets/Weekly-Services.webp";
import culturalEventsImg from "../../assets/Cultural-Events.webp";
import youthProgramsImg from "../../assets/Youth-Programs.webp";
import Section from "../ui/Section";
import SectionTitle from "../ui/SectionTitle";
import { C, body, display } from "../../theme";

const programs = [
  { line1: "Weekly", line2: "Services", sub: "Every Sunday, 9 AM", img: weeklyServicesImg },
  { line1: "Cultural", line2: "Events", sub: "Monthly Gatherings", img: culturalEventsImg },
  { line1: "Youth", line2: "Programs", sub: "Ages 12–25", img: youthProgramsImg },
];

export default function ProgramsSection() {
  return (
    <Section bg={C.cream}>
      <SectionTitle sub="Programs & Events" center>What We Offer</SectionTitle>
      <div className="programs-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginTop: 8 }}>
        {programs.map((p, i) => (
          <div key={i} style={{
            borderRadius: "16px 16px 0 0",
            overflow: "hidden",
            background: C.white,
            border: `1px solid ${C.border}`,
          }}>
            <img
              src={p.img}
              alt={p.title}
              style={{
                width: "100%",
                aspectRatio: "3 / 4",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div style={{ padding: "14px 20px 18px" }}>
              <div style={{
                fontSize: 26, fontWeight: 700, color: C.maroon,
                fontFamily: display, letterSpacing: 1, lineHeight: 1.2, marginBottom: 6,
              }}>
                {p.line1}<br />{p.line2}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.goldBright, fontFamily: body, textTransform: "uppercase", letterSpacing: 1 }}>
                {p.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button className="btn-outline" style={{
          padding: "12px 28px", background: "transparent", color: C.maroon,
          border: `1.5px solid ${C.maroon}`, borderRadius: 0, fontWeight: 600,
          fontSize: 13, cursor: "pointer", fontFamily: body,
        }}>
          View Calendar →
        </button>
      </div>
    </Section>
  );
}
