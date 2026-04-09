import { Link } from "react-router-dom";
import Section from "../ui/Section";
import SectionTitle from "../ui/SectionTitle";
import Badge from "../ui/Badge";
import { C, body, display } from "../../theme";
import { useDemo } from "../../context/DemoContext";
import { useLang } from "../../context/LangContext";

export default function EventsSection() {
  const { events } = useDemo();
  const { t } = useLang();
  const today = new Date().toISOString().split("T")[0];
  const upcomingEvents = events.filter(e => e.date >= today).slice(0, 6);

  return (
    <>
      <div id="events"/>
      <Section bg={C.white}>
        <SectionTitle sub={t("events.sectionSub")} center>{t("events.sectionTitle")}</SectionTitle>
        <div className="events-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {upcomingEvents.map((e, i) => (
            <div key={e.id || i} style={{
              padding: "20px", borderRadius: 0, border: `1px solid ${C.border}`,
              background: C.cream, display: "flex", gap: 14, alignItems: "flex-start",
            }}>
              <div style={{
                minWidth: 50, textAlign: "center", padding: "10px 6px",
                background: C.white, borderRadius: 0, border: `1px solid ${C.border}`,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.maroon, textTransform: "uppercase", fontFamily: body }}>{e.dateDisplay?.split(" ")[0]}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: C.maroonDark, fontFamily: display }}>{e.dateDisplay?.split(" ")[1]}</div>
                <div style={{ fontSize: 9, color: C.textLight, fontWeight: 600, fontFamily: body }}>{e.day}</div>
              </div>
              <div style={{ paddingTop: 2 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, lineHeight: 1.3, fontFamily: body }}>{e.title}</div>
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 5, fontFamily: body }}>{e.time}</div>
                <div style={{ marginTop: 8 }}><Badge>{e.category}</Badge></div>
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
            {t("events.viewCalendar")}
          </Link>
        </div>
      </Section>
    </>
  );
}
