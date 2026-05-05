import { useState, useRef, useEffect } from "react";
import { BellIcon } from "./Icons";
import { C, body } from "../../theme";

function formatRelativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsBell({ notifications = [], onDismiss, onClearAll }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const count = notifications.length;
  const displayCount = count > 9 ? "9+" : count > 0 ? String(count) : null;

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === "Escape") setOpen(false); };
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: open ? C.goldBright : "rgba(255,255,255,0.6)",
          display: "flex", alignItems: "center", padding: 4, position: "relative",
        }}
      >
        <BellIcon/>
        {displayCount && (
          <span style={{
            position: "absolute", top: 0, right: 0,
            background: C.red, color: C.white,
            fontSize: 9, fontWeight: 700, fontFamily: body,
            minWidth: 16, height: 16, borderRadius: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px", lineHeight: 1,
          }}>
            {displayCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notifications-dropdown" style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          width: 360, maxHeight: 480, background: C.white,
          border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          zIndex: 9000, display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0,
          }}>
            <span style={{ fontFamily: body, fontWeight: 700, fontSize: 13, color: C.textDark }}>
              Notifications
            </span>
            {count > 0 && (
              <button
                onClick={() => { onClearAll?.(); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: body, fontSize: 11, color: C.textLight,
                  fontWeight: 600, padding: 0, textDecoration: "underline",
                }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {count === 0 ? (
              <div style={{
                padding: "32px 16px", textAlign: "center",
                fontFamily: body, fontSize: 13, color: C.textLight,
              }}>
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 16px", borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: body, fontSize: 13, fontWeight: 600,
                      color: C.textDark, marginBottom: 2,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {n.title || n.eventName || "Notification"}
                    </div>
                    {n.message && (
                      <div style={{
                        fontFamily: body, fontSize: 12, color: C.textMid,
                        lineHeight: 1.4, marginBottom: 4,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {n.message}
                      </div>
                    )}
                    <div style={{ fontFamily: body, fontSize: 11, color: C.textLight }}>
                      {formatRelativeTime(n.timestamp)}
                    </div>
                  </div>
                  <button
                    onClick={() => onDismiss?.(n.id)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: C.textLight, fontSize: 18, lineHeight: 1,
                      padding: "0 2px", flexShrink: 0, marginTop: -2,
                    }}
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
