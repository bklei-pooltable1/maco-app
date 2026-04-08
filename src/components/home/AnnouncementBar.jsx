import { XIcon } from "../ui/Icons";
import { C, body } from "../../theme";

export default function AnnouncementBar({ onClose }) {
  return (
    <div style={{
      background: C.goldBright, padding: "10px 24px", display: "flex",
      alignItems: "center", justifyContent: "center", position: "relative", fontFamily: body,
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: C.maroonDeep, letterSpacing: 0.5 }}>
        Sundays 9am | In-Person @ New Farm
      </span>
      <button
        onClick={onClose}
        style={{
          position: "absolute", right: 20, background: "none", border: "none",
          cursor: "pointer", color: C.maroonDeep, opacity: 0.5, padding: 4,
        }}
      >
        <XIcon/>
      </button>
    </div>
  );
}
