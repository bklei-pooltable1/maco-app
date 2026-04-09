import { Link } from "react-router-dom";
import weeklyServicesImg from "../../assets/Weekly-Services.webp";
import culturalEventsImg from "../../assets/Cultural-Events.webp";
import youthProgramsImg from "../../assets/Youth-Programs.webp";
import Section from "../ui/Section";
import SectionTitle from "../ui/SectionTitle";
import { C, body, display } from "../../theme";

const programs = [
  {
    img: weeklyServicesImg,
    line1: "Weekly",
    line2: "Services",
    sub: "Sunday Church & Community",
  },
  {
    img: culturalEventsImg,
    line1: "Cultural",
    line2: "Events",
    sub: "Festivals, Dance & Tradition",
  },
  {
    img: youthProgramsImg,
    line1: "Youth",
    line2: "Programs",
    sub: "Language, Sport & Leadership",
  },
];

export default function ProgramsSection() {
  return (
    <Section bg={C.cream}>
      <SectionTitle sub="What We Offer" center>Programs &amp; Events</SectionTitle>
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
              alt={p.line1 + " " + p.line2}
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
              <div style={{ fontSize: 17, fontWeight: 600, color: C.goldBright, fontFamily: body, textTransform: "uppercase", letterSpacing: 1 }}>
                {p.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Link to="/calendar" className="btn-outline" style={{
          display: "inline-block",
          padding: "12px 28px", color: C.maroon,
          border: `1.5px solid ${C.maroon}`, fontWeight: 600,
          fontSize: 13, fontFamily: body, textDecoration: "none",
        }}>
          View Full Calendar
        </Link>
      </div>
    </Section>
  );
}
