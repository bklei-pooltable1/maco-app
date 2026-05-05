import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { enUS as enUSLocale, mk as mkLocale } from "date-fns/locale";
import Badge from "../components/ui/Badge";
import { C, body, display } from "../theme";
import { useDemo } from "../context/DemoContext";
import { useLang } from "../context/LangContext";
import { canSee } from "../lib/tiers";
import PublicNav from "../components/layout/PublicNav";
import MacoCalendar from "../components/ui/MacoCalendar";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const categoryColors = {
  "Weekly Service": C.maroon,
  "Holiday": "#7b5ea7",
  "Youth Program": C.green,
  "Social": "#1a7fbf",
  "Cultural Event": "#c0682b",
};

const DATE_LOCALES = { en: enUSLocale, mk: mkLocale };

function parseEventDate(dateStr, timeStr) {
  if (!dateStr) return new Date();
  const [yr, mo, dy] = dateStr.split("-").map(Number);
  if (!timeStr) return new Date(yr, mo - 1, dy, 0, 0);
  const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return new Date(yr, mo - 1, dy, 0, 0);
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  const ampm = m[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return new Date(yr, mo - 1, dy, h, min);
}

// ─── PublicEventPopover ───────────────────────────────────────────────────────

function PublicEventPopover({ event, position, onClose }) {
  const popoverRef = useRef(null);
  const { t, lang, cyrillicDisplay } = useLang();

  useEffect(() => {
    function handleOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose]);

  const headerBg = categoryColors[event.category] || C.maroon;
  const locale = DATE_LOCALES[lang] || DATE_LOCALES.en;
  const dateStr = (event.start instanceof Date && !isNaN(event.start))
    ? format(event.start, t("calendar.popover.dateTimeFormat"), { locale })
    : (event.dateDisplay || event.date || "");
  const timeRange = event.time && event.endTime
    ? `${event.time} – ${event.endTime}`
    : (event.time || "");

  return (
    <div
      ref={popoverRef}
      className="maco-cal-popover"
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 1000,
        background: C.white,
        border: `1px solid ${C.border}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        width: 320,
        maxWidth: "90vw",
        borderRadius: 0,
        fontFamily: body,
      }}
    >
      <div style={{
        background: headerBg,
        padding: "14px 16px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 8,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, fontFamily: body,
            color: "rgba(255,255,255,0.65)", letterSpacing: 1,
            textTransform: "uppercase", marginBottom: 4,
          }}>
            {event.category}
          </div>
          <div style={{
            fontSize: 16, fontWeight: 700, color: "#ffffff",
            lineHeight: 1.3,
            fontFamily: lang === "mk" ? cyrillicDisplay : display,
            wordBreak: "break-word",
          }}>
            {event.title}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label={t("calendar.popover.close")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.65)", fontSize: 22, lineHeight: 1,
            padding: 0, flexShrink: 0, fontFamily: body,
          }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: "14px 16px" }}>
        <div style={{ marginBottom: 10 }}>
          <Badge>{event.category}</Badge>
        </div>
        <div style={{ fontSize: 13, color: C.textMid, fontFamily: body, marginBottom: 12, fontWeight: 500 }}>
          {dateStr}{timeRange ? ` · ${timeRange}` : ""}
        </div>

        {event.location && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body, marginBottom: 3 }}>
              {t("calendar.popover.location")}
            </div>
            <div style={{ fontSize: 13, color: C.textDark, fontFamily: body }}>{event.location}</div>
          </div>
        )}

        {event.description && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body, marginBottom: 3 }}>
              {t("calendar.popover.description")}
            </div>
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, fontFamily: body, margin: 0 }}>
              {event.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Public Calendar ──────────────────────────────────────────────────────────

export default function PublicCalendar() {
  const { events } = useDemo();
  const { t, lang, cyrillicDisplay } = useLang();
  const publicEvents = events.filter(e => canSee("general", e.visibility ?? "general"));
  const [popover, setPopover] = useState(null); // { event, x, y }

  const headingFont = lang === "mk" ? cyrillicDisplay : display;

  const rbcEvents = publicEvents.map(e => ({
    ...e,
    start: parseEventDate(e.date, e.time),
    end:   parseEventDate(e.date, e.endTime || e.time),
  }));

  const handleSelectEvent = (event, nativeEvent) => {
    const POPOVER_W = 320;
    const POPOVER_H = 300;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = (nativeEvent?.clientX ?? 200) + 12;
    let y = (nativeEvent?.clientY ?? 200) - 10;
    if (x + POPOVER_W > vw - 16) x = vw - POPOVER_W - 16;
    if (x < 8) x = 8;
    if (y + POPOVER_H > vh - 16) y = vh - POPOVER_H - 16;
    if (y < 8) y = 8;
    setPopover({ event, x, y });
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingEvents = publicEvents
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div style={{ fontFamily: body, background: C.cream, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: C.maroon, borderBottom: `2px solid #EABF3D` }}>
        <PublicNav/>
      </div>

      {/* Page title */}
      <div className="cal-page-title" style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "32px 24px 28px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: 2, textTransform: "uppercase", fontFamily: body, marginBottom: 10 }}>
            {t("events.sectionSub")}
          </div>
          <h1 style={{ fontFamily: headingFont, fontSize: 36, color: C.textDark, letterSpacing: 1.5, margin: "0 0 8px" }}>
            {t("calendar.pageTitle")}
          </h1>
          <p style={{ fontSize: 14, color: C.textLight, fontFamily: body, margin: 0 }}>
            {t("calendar.pageSub")}
          </p>
        </div>
      </div>

      <div className="cal-main-content" style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>

        {/* MacoCalendar */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: 24, marginBottom: 28 }}>
          <MacoCalendar
            events={rbcEvents}
            categoryColors={categoryColors}
            onSelectEvent={handleSelectEvent}
          />
        </div>

        {/* Upcoming this month */}
        {upcomingEvents.length > 0 && (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: "20px 24px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 1, fontFamily: body, marginBottom: 14 }}>
              {t("calendar.upcomingThisMonth")}
            </div>
            {upcomingEvents.map((e, i) => (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  gap: 14,
                  paddingBottom: i < upcomingEvents.length - 1 ? 12 : 0,
                  marginBottom: i < upcomingEvents.length - 1 ? 12 : 0,
                  borderBottom: i < upcomingEvents.length - 1 ? `1px solid ${C.border}` : "none",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: C.maroon, fontFamily: body, minWidth: 52, paddingTop: 2 }}>
                  {e.date}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, fontFamily: body, marginBottom: 2 }}>{e.title}</div>
                  {e.time && (
                    <div style={{ fontSize: 12, color: C.textLight, fontFamily: body }}>
                      {e.time}{e.endTime ? ` – ${e.endTime}` : ""}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {popover && (
        <PublicEventPopover
          event={popover.event}
          position={{ x: popover.x, y: popover.y }}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
}
