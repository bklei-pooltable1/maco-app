import { C, display, body } from "../../theme";

export default function SectionTitle({ sub, children, light = false, center = false }) {
  return (
    <div style={{ marginBottom: 40, textAlign: center ? "center" : "left" }}>
      {sub && (
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: light ? C.goldBright : C.maroon,
          textTransform: "uppercase", letterSpacing: 3, marginBottom: 12, fontFamily: body,
        }}>
          {sub}
        </div>
      )}
      <h2 style={{
        fontSize: 30, fontWeight: 700,
        color: light ? C.white : C.textDark,
        margin: 0, lineHeight: 1.2, fontFamily: display, letterSpacing: 1.5,
      }}>
        {children}
      </h2>
    </div>
  );
}
