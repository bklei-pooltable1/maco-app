import communityImg from "../../assets/community-image.webp";
import Section from "../ui/Section";
import SectionTitle from "../ui/SectionTitle";
import { C, body } from "../../theme";

export default function AboutSection() {
  return (
    <Section bg={C.white}>
      <div id="about" style={{ scrollMarginTop: 60 }}/>
      <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
        <div>
          <SectionTitle sub="About Us">Our Community</SectionTitle>
          <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.8, margin: "0 0 16px", fontFamily: body }}>
            We are a vibrant Macedonian Orthodox community dedicated to preserving our faith, language, and cultural heritage. Our church serves as a spiritual home and gathering place for Macedonian families across the greater Brisbane area.
          </p>
          <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.8, margin: 0, fontFamily: body }}>
            Through regular services, cultural celebrations, youth programs, and community events, we create a welcoming environment for all generations to connect, worship, and grow together.
          </p>
        </div>
        <img
          src={communityImg}
          alt="Macedonian Community of Brisbane"
          style={{ width: "100%", minHeight: 300, objectFit: "cover", borderRadius: 16, display: "block" }}
        />
      </div>
    </Section>
  );
}
