import communityImg from "../../assets/community-image.webp";
import Section from "../ui/Section";
import SectionTitle from "../ui/SectionTitle";
import { C, body } from "../../theme";
import { useLang } from "../../context/LangContext";

export default function AboutSection() {
  const { t } = useLang();

  return (
    <Section bg={C.white}>
      <div id="about" style={{ scrollMarginTop: 60 }}/>
      <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
        <div>
          <SectionTitle sub={t("about.sectionSub")}>{t("about.sectionTitle")}</SectionTitle>
          <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.8, margin: "0 0 16px", fontFamily: body }}>
            {t("about.para1")}
          </p>
          <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.8, margin: 0, fontFamily: body }}>
            {t("about.para2")}
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
