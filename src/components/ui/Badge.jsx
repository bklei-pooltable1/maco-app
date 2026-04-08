import { C, body } from "../../theme";

export default function Badge({ children, color = "gold" }) {
  const bg =
    color === "green" ? C.greenLight :
    color === "red" ? "rgba(192,57,43,0.1)" :
    color === "maroon" ? "rgba(140,26,17,0.08)" :
    C.goldMuted;
  const fg =
    color === "green" ? C.green :
    color === "red" ? C.red :
    color === "maroon" ? C.maroon :
    C.gold;
  return (
    <span style={{
      display: "inline-block", padding: "3px 11px", borderRadius: 0,
      fontSize: 11, fontWeight: 600, background: bg, color: fg, fontFamily: body,
    }}>
      {children}
    </span>
  );
}
