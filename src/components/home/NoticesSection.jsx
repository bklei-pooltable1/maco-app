import Section from "../ui/Section";
import SectionTitle from "../ui/SectionTitle";
import Badge from "../ui/Badge";
import { C, body } from "../../theme";
import { useDemo } from "../../context/DemoContext";

export default function NoticesSection() {
  const { notices } = useDemo();
  const sorted = [...notices]
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.postedAt?.localeCompare(a.postedAt || ""))
    .slice(0, 4);

  return (
    <Section bg={C.cream}>
      <div id="notices" className="scroll-anchor"/>
      <SectionTitle sub="From the Committee" center>Community Notice Board</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.map((n, i) => (
          <div key={n.id || i} style={{
            padding: "22px 24px", background: C.white, borderRadius: 0,
            border: `1px solid ${C.border}`,
            borderLeft: n.pinned ? `3px solid ${C.maroon}` : `1px solid ${C.border}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: C.textDark, fontFamily: body }}>{n.title}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {n.pinned && <Badge color="maroon">Pinned</Badge>}
                <span style={{ fontSize: 12, color: C.textLight, fontFamily: body }}>{n.postedAt}</span>
              </div>
            </div>
            <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.7, margin: "0 0 8px", fontFamily: body }}>{n.body}</p>
            <div style={{ fontSize: 12, color: C.textLight, fontFamily: body }}>Posted by {n.author}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
