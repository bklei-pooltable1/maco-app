import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SunIcon } from "../components/ui/Icons";
import Badge from "../components/ui/Badge";
import { C, body, display } from "../theme";
import { useDemo } from "../context/DemoContext";
import { useLang } from "../context/LangContext";
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

const inputStyle = {
  width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`,
  borderRadius: 0, fontSize: 13, fontFamily: body, color: C.textDark,
  background: C.white, outline: "none", boxSizing: "border-box",
};

const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 600, color: C.textMid,
  marginBottom: 5, fontFamily: body, textTransform: "uppercase", letterSpacing: 0.5,
};

// ─── Hall Hire Enquiry Form ───────────────────────────────────────────────────

function HallHireForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", date: "",
    slot: "fullday", eventType: "", guests: "", notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!form.date) e.date = "Required";
    if (!form.eventType.trim()) e.eventType = "Required";
    if (!form.guests) e.guests = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
        <h3 style={{ fontFamily: display, fontSize: 20, color: C.green, marginBottom: 10 }}>Enquiry Submitted!</h3>
        <p style={{ fontSize: 14, color: C.textMid, fontFamily: body, lineHeight: 1.7 }}>
          Thank you for your hall hire enquiry. The committee will be in touch shortly to confirm your booking.
        </p>
        <button onClick={() => setSubmitted(false)} style={{ marginTop: 20, padding: "10px 24px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 0, fontSize: 13, cursor: "pointer", fontFamily: body, color: C.textMid }}>
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Your Name *</label>
          <input style={{ ...inputStyle, borderColor: errors.name ? C.red : C.border }} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name"/>
          {errors.name && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.name}</span>}
        </div>
        <div>
          <label style={labelStyle}>Email *</label>
          <input type="email" style={{ ...inputStyle, borderColor: errors.email ? C.red : C.border }} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com"/>
          {errors.email && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.email}</span>}
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input style={inputStyle} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="0412 345 678"/>
        </div>
        <div>
          <label style={labelStyle}>Preferred Date *</label>
          <input type="date" style={{ ...inputStyle, borderColor: errors.date ? C.red : C.border }} value={form.date} min={new Date().toISOString().split("T")[0]} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}/>
          {errors.date && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.date}</span>}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Booking Type *</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { value: "morning",   label: "Morning Slot (9am – 1pm)" },
            { value: "afternoon", label: "Afternoon Slot (1pm – 5pm)" },
            { value: "fullday",   label: "Full Day (9am – 5pm)" },
          ].map(opt => (
            <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontFamily: body, color: C.textDark, padding: "9px 14px", border: `1px solid ${form.slot === opt.value ? C.maroon : C.border}`, background: form.slot === opt.value ? "rgba(140,26,17,0.06)" : C.white }}>
              <input type="radio" name="slot" value={opt.value} checked={form.slot === opt.value} onChange={() => setForm(p => ({ ...p, slot: opt.value }))} style={{ accentColor: C.maroon }}/>
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Occasion / Event Type *</label>
          <input style={{ ...inputStyle, borderColor: errors.eventType ? C.red : C.border }} value={form.eventType} onChange={e => setForm(p => ({ ...p, eventType: e.target.value }))} placeholder="e.g. Birthday, Wedding, Meeting"/>
          {errors.eventType && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.eventType}</span>}
        </div>
        <div>
          <label style={labelStyle}>Expected Guests *</label>
          <input type="number" min={1} max={150} style={{ ...inputStyle, borderColor: errors.guests ? C.red : C.border }} value={form.guests} onChange={e => setForm(p => ({ ...p, guests: e.target.value }))} placeholder="How many guests?"/>
          {errors.guests && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.guests}</span>}
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Additional Notes</label>
        <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any special requirements, layout preferences, equipment needs…"/>
      </div>

      <div style={{ background: C.goldMuted, border: `1px solid ${C.goldLight}`, padding: "10px 14px", marginBottom: 16, fontSize: 12, fontFamily: body, color: C.textMid }}>
        💡 Hall capacity: up to 150 guests. Members receive a <strong>20% discount</strong>. Bookings are subject to committee approval.
      </div>

      <button type="submit" style={{ padding: "13px 32px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: body }}>
        Submit Hall Hire Enquiry
      </button>
      <div style={{ marginTop: 12, fontSize: 12, color: C.textLight, fontFamily: body }}>
        To become a member and receive a discount, <Link to="/signup" style={{ color: C.maroon, textDecoration: "underline" }}>join here</Link>.
      </div>
    </form>
  );
}

// ─── Public Calendar ──────────────────────────────────────────────────────────

export default function PublicCalendar() {
  const { events, hallHireBookings, blockedSlots, addHallHireBooking } = useDemo();
  const { t, lang, cyrillicDisplay } = useLang();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const headingFont = lang === "mk" ? cyrillicDisplay : display;

  const cells = getCalendarDays(year, month);

  // Events indexed by day for this month
  const eventsThisMonth = {};
  events.forEach(e => {
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

  const handleHireSubmit = (form) => {
    addHallHireBooking({
      name: form.name,
      email: form.email,
      phone: form.phone,
      date: form.date,
      dateDisplay: form.date,
      slot: form.slot,
      eventType: form.eventType,
      expectedGuests: parseInt(form.guests),
      notes: form.notes,
    });
  };

  return (
    <div style={{ fontFamily: body, background: C.cream, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: C.maroon, borderBottom: `2px solid #EABF3D` }}>
        <PublicNav/>
      </div>

      {/* Page title */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "32px 24px 28px" }}>
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

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>

        {/* Calendar grid + event panel */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, marginBottom: 48 }}>
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
                const slots = blockedSlots[iso] || [];
                const hasHireMorning = slots.includes("morning");
                const hasHireAfternoon = slots.includes("afternoon");

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
                    {/* Half-day hire indicators */}
                    {(hasHireMorning || hasHireAfternoon) && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", pointerEvents: "none" }}>
                        <div style={{ flex: 1, background: hasHireMorning ? "rgba(192,57,43,0.12)" : "transparent" }}/>
                        <div style={{ flex: 1, background: hasHireAfternoon ? "rgba(192,57,43,0.12)" : "transparent" }}/>
                      </div>
                    )}
                    <span style={{ fontSize: 12, fontFamily: body, fontWeight: isToday ? 700 : 400, color: isSelected ? C.white : isToday ? C.maroon : C.textDark, position: "relative", zIndex: 1, marginTop: 2 }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 16, height: 8, background: "rgba(192,57,43,0.12)", border: `1px solid ${C.border}` }}/>
                <span style={{ fontSize: 10, color: C.textLight, fontFamily: body }}>Hall booked (AM/PM)</span>
              </div>
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

        {/* Hall Hire Section */}
        <div id="book-hall" style={{ background: C.white, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ background: C.maroon, padding: "24px 32px" }}>
            <h2 style={{ fontFamily: headingFont, fontSize: 26, color: C.white, letterSpacing: 1, margin: "0 0 6px" }}>
              {t("calendar.bookHall")}
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: body, margin: 0 }}>
              {t("calendar.bookHallSub")}
            </p>
          </div>
          <div style={{ padding: "28px 32px" }}>
            <HallHireForm onSubmit={handleHireSubmit}/>
          </div>
        </div>
      </div>
    </div>
  );
}
