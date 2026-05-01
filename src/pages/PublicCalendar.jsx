import { useState } from "react";
import { Link } from "react-router-dom";
import { SunIcon } from "../components/ui/Icons";
import Badge from "../components/ui/Badge";
import { C, body, display } from "../theme";
import { useDemo } from "../context/DemoContext";
import { useLang } from "../context/LangContext";
import { canSee } from "../lib/tiers";
import PublicNav from "../components/layout/PublicNav";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function toISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const categoryColors = {
  "Weekly Service": C.maroon,
  "Holiday": "#7b5ea7",
  "Youth Program": C.green,
  "Social": "#1a7fbf",
  "Cultural Event": "#c0682b",
};

// ─── Public Calendar ──────────────────────────────────────────────────────────

export default function PublicCalendar() {
  const { events } = useDemo();
  const { t, lang, cyrillicDisplay } = useLang();
  const publicEvents = events.filter(e => canSee("general", e.visibility ?? "general"));
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const headingFont = lang === "mk" ? cyrillicDisplay : display;

  const cells = getCalendarDays(year, month);

  // Events indexed by day for this month
  const eventsThisMonth = {};
  publicEvents.forEach(e => {
    const [y, m, d] = e.date.split("-").map(Number);
    if (y === year && m - 1 === month) {
      if (!eventsThisMonth[d]) eventsThisMonth[d] = [];
      eventsThisMonth[d].push(e);
    }
  });

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const dayEvents = selectedDay ? (eventsThisMonth[selectedDay] || []) : [];

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

        {/* Calendar grid + event panel */}
        <div className="public-cal-layout" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, marginBottom: 48 }}>
          {/* Calendar */}
          <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: 24 }}>
            {/* Month nav */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <button onClick={prevMonth} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 0, padding: "7px 16px", cursor: "pointer", fontFamily: body, fontSize: 14, color: C.textMid }}>←</button>
              <span style={{ fontFamily: headingFont, fontSize: 20, color: C.textDark, letterSpacing: 1 }}>{MONTHS[month]} {year}</span>
              <button onClick={nextMonth} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 0, padding: "7px 16px", cursor: "pointer", fontFamily: body, fontSize: 14, color: C.textMid }}>→</button>
            </div>

            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: C.textLight, fontFamily: body, padding: "5px 0", letterSpacing: 0.5 }}>{d}</div>
              ))}
            </div>

            {/* Cells */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={i}/>;
                const iso = toISO(year, month, day);
                const dayEvts = eventsThisMonth[day] || [];
                const hasEvents = dayEvts.length > 0;
                const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
                const isSelected = day === selectedDay;

                return (
                  <div
                    key={i}
                    onClick={() => hasEvents && setSelectedDay(day === selectedDay ? null : day)}
                    style={{
                      aspectRatio: "1",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      padding: "4px 2px",
                      cursor: hasEvents ? "pointer" : "default",
                      background: isSelected ? C.maroon : isToday ? C.goldMuted : C.white,
                      border: isToday && !isSelected ? `1px solid ${C.gold}` : `1px solid ${C.border}`,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <span style={{ fontSize: 12, fontFamily: body, fontWeight: isToday ? 700 : 400, color: isSelected ? C.white : isToday ? C.maroon : C.textDark, marginTop: 2 }}>
                      {day}
                    </span>
                    {/* Event dots */}
                    {hasEvents && (
                      <div style={{ display: "flex", gap: 2, position: "relative", zIndex: 1 }}>
                        {dayEvts.slice(0, 3).map((e, j) => (
                          <div key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? C.white : e.membersOnly ? C.border : (categoryColors[e.category] || C.maroon) }}/>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
              {Object.entries(categoryColors).map(([cat, color]) => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }}/>
                  <span style={{ fontSize: 10, color: C.textLight, fontFamily: body }}>{cat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Event detail panel */}
          <div>
            {dayEvents.length === 0 ? (
              <div style={{ padding: 24, border: `1px solid ${C.border}`, background: C.white, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>📅</div>
                <div style={{ fontSize: 13, color: C.textLight, fontFamily: body }}>
                  Select a date with events to view details
                </div>
                <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                  <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, marginBottom: 8 }}>Upcoming this month</div>
                  {Object.entries(eventsThisMonth)
                    .sort((a, b) => Number(a[0]) - Number(b[0]))
                    .slice(0, 4)
                    .map(([d, evts]) => evts.map(e => (
                      <div key={e.id} style={{ fontSize: 12, color: C.textMid, fontFamily: body, marginBottom: 6, textAlign: "left", display: "flex", gap: 8 }}>
                        <span style={{ color: C.maroon, fontWeight: 700, minWidth: 20 }}>{d}</span>
                        <span>{e.title}</span>
                      </div>
                    )))
                  }
                </div>
              </div>
            ) : (
              dayEvents.map(e => (
                <div key={e.id} style={{ border: `1px solid ${C.border}`, background: C.white, marginBottom: 12, overflow: "hidden" }}>
                  {e.membersOnly ? (
                    // Member-only: obscured block
                    <div style={{ padding: "20px 18px", position: "relative" }}>
                      <div style={{ position: "absolute", inset: 0, background: "rgba(251,248,241,0.85)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                        <div style={{ fontSize: 20, marginBottom: 6 }}>🔒</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, fontFamily: body, marginBottom: 4 }}>
                          {t("calendar.membersOnly")}
                        </div>
                        <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, marginBottom: 12 }}>
                          {t("calendar.reserved")}
                        </div>
                        <Link to="/signup" style={{ padding: "8px 18px", background: C.maroon, color: C.white, textDecoration: "none", fontSize: 12, fontWeight: 700, fontFamily: body }}>
                          Join to View
                        </Link>
                      </div>
                      {/* Blurred background content */}
                      <div style={{ filter: "blur(3px)", userSelect: "none" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.maroon, fontFamily: body, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" }}>{e.category}</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: C.textDark, fontFamily: body, marginBottom: 4 }}>Members Only Event</div>
                        <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, marginBottom: 4 }}>🕐 {e.time} – {e.endTime}</div>
                        <div style={{ fontSize: 12, color: C.textLight, fontFamily: body }}>📍 Community Hall</div>
                      </div>
                    </div>
                  ) : (
                    // Public event
                    <div style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: categoryColors[e.category] || C.maroon, fontFamily: body, letterSpacing: 0.5, textTransform: "uppercase" }}>{e.category}</div>
                        <Badge>{e.category}</Badge>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: C.textDark, fontFamily: body, marginBottom: 6 }}>{e.title}</div>
                      <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, marginBottom: 4 }}>🕐 {e.time} – {e.endTime}</div>
                      <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, marginBottom: 12 }}>📍 {e.location}</div>
                      <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6, fontFamily: body }}>{e.description}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
