import { C } from "../../theme";

export default function Section({ children, bg = "transparent", style: s = {} }) {
  return (
    <div className="section-outer" style={{ padding: "72px 24px", background: bg, ...s }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}
