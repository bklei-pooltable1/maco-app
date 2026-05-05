import "react-big-calendar/lib/css/react-big-calendar.css";
import "./maco-calendar.css";
import { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS, mk } from "date-fns/locale";
import { C, body } from "../../theme";
import { useLang } from "../../context/LangContext";

const locales = { en: enUS, mk };

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

function MacoToolbar({ label, onNavigate, onView, view, views }) {
  const { t } = useLang();
  const [hov, setHov] = useState(null);

  const viewLabels = {
    month:  t("calendar.view.month"),
    week:   t("calendar.view.week"),
    day:    t("calendar.view.day"),
    agenda: t("calendar.view.agenda"),
  };

  const chevronStyle = (key) => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    color: hov === key ? C.maroon : C.textMid,
    transition: "color 0.15s",
  });

  return (
    <div className="rbc-toolbar" style={{ justifyContent: "space-between", alignItems: "center" }}>
      {/* Left — Today */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
        <div className="rbc-btn-group">
          <button onClick={() => onNavigate("TODAY")}>{t("calendar.toolbar.today")}</button>
        </div>
      </div>

      {/* Center — ‹ label › */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          aria-label={t("calendar.toolbar.previousLabel")}
          style={chevronStyle("prev")}
          onMouseEnter={() => setHov("prev")}
          onMouseLeave={() => setHov(null)}
          onClick={() => onNavigate("PREV")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span style={{
          fontFamily: body, fontSize: 15, fontWeight: 700, color: C.textDark,
          letterSpacing: 0.5, minWidth: 150, textAlign: "center", padding: "0 4px",
        }}>
          {label}
        </span>
        <button
          aria-label={t("calendar.toolbar.nextLabel")}
          style={chevronStyle("next")}
          onMouseEnter={() => setHov("next")}
          onMouseLeave={() => setHov(null)}
          onClick={() => onNavigate("NEXT")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Right — view switcher */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        <div className="rbc-btn-group">
          {views.map((v) => (
            <button key={v} className={v === view ? "rbc-active" : ""} onClick={() => onView(v)}>
              {viewLabels[v] ?? v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MonthEvent ───────────────────────────────────────────────────────────────

function MonthEvent({ event }) {
  const formatTime = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
      .format(date)
      .replace(/\s/g, "")
      .toLowerCase();
  };

  const startStr  = formatTime(event.start);
  const endStr    = formatTime(event.end);
  const timeRange = startStr && endStr && startStr !== endStr
    ? `${startStr} – ${endStr}`
    : startStr;

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 1,
      padding: "4px 6px", width: "100%", height: "100%",
      overflow: "hidden", cursor: "pointer",
    }}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: "#ffffff",
        lineHeight: 1.25,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        wordBreak: "break-word",
        marginBottom: 2,
      }}>
        {event.title}
      </div>
      {timeRange && (
        <div style={{
          fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.85)",
          lineHeight: 1.2, whiteSpace: "nowrap",
          overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {timeRange}
        </div>
      )}
      {event.location && (
        <div style={{
          fontSize: 10, fontStyle: "italic", color: "rgba(255,255,255,0.75)",
          lineHeight: 1.2, whiteSpace: "nowrap",
          overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {event.location}
        </div>
      )}
    </div>
  );
}

export default function MacoCalendar({
  events = [],
  defaultView = "month",
  views = ["month", "week", "day"],
  onSelectEvent,
  categoryColors = {},
  style = {},
}) {
  const { t, lang } = useLang();

  const messages = useMemo(() => ({
    today:           t("calendar.toolbar.today"),
    previous:        t("calendar.toolbar.back"),
    next:            t("calendar.toolbar.next"),
    month:           t("calendar.view.month"),
    week:            t("calendar.view.week"),
    day:             t("calendar.view.day"),
    agenda:          t("calendar.view.agenda"),
    date:            t("calendar.agenda.date"),
    time:            t("calendar.agenda.time"),
    event:           t("calendar.agenda.event"),
    noEventsInRange: t("calendar.noEvents"),
    showMore: (n) => `+${n}`,
  }), [t]);

  const eventPropGetter = useMemo(() => (event) => ({
    style: {
      backgroundColor: categoryColors[event.category] || C.maroon,
      borderRadius: 0,
      border: "none",
      color: "#ffffff",
      fontFamily: body,
      fontSize: 12,
      fontWeight: 600,
      padding: "2px 6px",
      cursor: "pointer",
    },
  }), [categoryColors]);

  const dayPropGetter = useMemo(() => (date) => {
    const today = new Date();
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth()    === today.getMonth()    &&
      date.getDate()     === today.getDate();
    return isToday ? { style: { backgroundColor: C.goldLight } } : {};
  }, []);

  const components = useMemo(() => ({
    toolbar: MacoToolbar,
    month: { event: MonthEvent },
  }), []);

  return (
    <div className="maco-cal-wrapper" style={{ minHeight: 620, fontFamily: body, ...style }}>
      <Calendar
        localizer={localizer}
        events={events}
        defaultView={defaultView}
        views={views}
        messages={messages}
        culture={lang}
        eventPropGetter={eventPropGetter}
        dayPropGetter={dayPropGetter}
        onSelectEvent={onSelectEvent}
        components={components}
        popup
      />
    </div>
  );
}
