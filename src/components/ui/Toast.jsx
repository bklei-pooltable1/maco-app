import { useState, useEffect } from "react";
import { C, body } from "../../theme";

export default function Toast({ message, visible, onDismiss, duration = 10000 }) {
  const [hovX, setHovX] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="maco-toast"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9000,
        background: C.textDark,
        color: C.white,
        padding: "12px 18px",
        borderRadius: 0,
        fontFamily: body,
        fontSize: 13,
        fontWeight: 500,
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        maxWidth: 360,
        opacity: 1,
        transform: "translateY(0)",
        transition: "opacity 0.2s, transform 0.2s",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        justifyContent: "space-between",
      }}
    >
      <div style={{ flex: 1 }}>{message}</div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        onMouseEnter={() => setHovX(true)}
        onMouseLeave={() => setHovX(false)}
        style={{
          background: "transparent",
          border: "none",
          color: hovX ? C.white : "rgba(255,255,255,0.6)",
          fontSize: 18,
          lineHeight: 1,
          padding: 0,
          cursor: "pointer",
          flexShrink: 0,
          fontFamily: body,
          transition: "color 0.15s",
        }}
      >×</button>
    </div>
  );
}
