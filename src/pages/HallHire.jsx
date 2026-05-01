import { useState } from "react";
import { Link } from "react-router-dom";
import { C, body, display } from "../theme";
import { useDemo } from "../context/DemoContext";
import { useLang } from "../context/LangContext";
import { HALL_SLOTS, getPriceForBooking, MEMBER_DISCOUNT_PERCENT } from "../data/mockData";
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

const inputStyle = {
  width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`,
  borderRadius: 0, fontSize: 13, fontFamily: body, color: C.textDark,
  background: C.white, outline: "none", boxSizing: "border-box",
};

const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 600, color: C.textMid,
  marginBottom: 5, fontFamily: body, textTransform: "uppercase", letterSpacing: 0.5,
};

// ─── Hall Hire Page ───────────────────────────────────────────────────────────

export default function HallHire() {
  const { addHallHireBooking, blockedDates, blockedSlots, hallHireBookings, currentMember, role } = useDemo();
  const { t, lang, cyrillicDisplay } = useLang();
  const headingFont = lang === "mk" ? cyrillicDisplay : display;
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const isLoggedIn = role !== "public";
  const isMember = isLoggedIn;
  const [form, setForm] = useState({
    name:      isLoggedIn ? (currentMember?.fullName || "") : "",
    email:     isLoggedIn ? (currentMember?.email    || "") : "",
    phone:     isLoggedIn ? (currentMember?.phone    || "") : "",
    date:      "",
    slot:      "fullday",
    eventType: "",
    guests:    "",
    notes:     "",
  });
  const [errors, setErrors]      = useState({});
  const [submitted, setSubmitted] = useState(false);

  const cells = getCalendarDays(year, month);
  const pendingDates = hallHireBookings.filter(b => b.status === "pending").map(b => b.date);

  const getDateStatus = (day) => {
    const iso = toISO(year, month, day);
    if (blockedDates.includes(iso)) return "booked";
    if (pendingDates.includes(iso)) return "pending";
    if (new Date(year, month, day) < today) return "past";
    return "available";
  };

  const availableSlots = (iso) => {
    if (!iso) return Object.keys(HALL_SLOTS);
    const taken = blockedSlots[iso] || [];
    return Object.keys(HALL_SLOTS).filter(s => {
      if (s === "fullday") return !taken.includes("morning") && !taken.includes("afternoon");
      return !taken.includes(s);
    });
  };

  const handleSelectDay = (day) => {
    const status = getDateStatus(day);
    if (status === "booked" || status === "past") return;
    const iso = toISO(year, month, day);
    const slots = availableSlots(iso);
    setForm(f => ({ ...f, date: iso, slot: slots[0] || "fullday" }));
    setErrors(e => ({ ...e, date: undefined }));
  };

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())      e.name      = "Required";
    if (!form.email.trim())     e.email     = "Required";
    if (!form.date)             e.date      = "Required";
    if (!form.eventType.trim()) e.eventType = "Required";
    if (!form.guests)           e.guests    = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const priceInfo = getPriceForBooking({ slot: form.slot, isMember });
    addHallHireBooking({
      name:           form.name,
      email:          form.email,
      phone:          form.phone,
      date:           form.date,
      dateDisplay:    form.date,
      slot:           form.slot,
      eventType:      form.eventType,
      expectedGuests: parseInt(form.guests),
      notes:          form.notes,
      fullPrice:      priceInfo.fullPrice,
      appliedPrice:   priceInfo.appliedPrice,
      isMember,
      ...(isLoggedIn && currentMember ? { memberId: currentMember.id } : {}),
    });
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm({
      name:      isLoggedIn ? (currentMember?.fullName || "") : "",
      email:     isLoggedIn ? (currentMember?.email    || "") : "",
      phone:     isLoggedIn ? (currentMember?.phone    || "") : "",
      date: "", slot: "fullday", eventType: "", guests: "", notes: "",
    });
  };

  const slotsForDate = availableSlots(form.date || null);

  return (
    <div style={{ fontFamily: body, background: C.cream, minHeight: "100vh" }}>
      <div style={{ background: C.maroon, borderBottom: `2px solid #EABF3D` }}>
        <PublicNav/>
      </div>

      {/* Page title */}
      <div className="cal-page-title" style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "32px 24px 28px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: 2, textTransform: "uppercase", fontFamily: body, marginBottom: 10 }}>
            {t("nav.hallHire")}
          </div>
          <h1 style={{ fontFamily: headingFont, fontSize: 36, color: C.textDark, letterSpacing: 1.5, margin: "0 0 8px" }}>
            {t("hallHire.pageTitle")}
          </h1>
          <p style={{ fontSize: 14, color: C.textLight, fontFamily: body, margin: 0 }}>
            {t("hallHire.pageSubtitle")}
          </p>
        </div>
      </div>

      <div className="cal-main-content" style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        {submitted ? (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: "48px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <h3 style={{ fontFamily: headingFont, fontSize: 22, color: C.green, marginBottom: 10 }}>
              {t("hallHire.successTitle")}
            </h3>
            <p style={{ fontSize: 14, color: C.textMid, fontFamily: body, lineHeight: 1.7, marginBottom: 24 }}>
              {t("hallHire.successBodyV2")}
            </p>
            <button onClick={handleReset} style={{ padding: "10px 24px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 0, fontSize: 13, cursor: "pointer", fontFamily: body, color: C.textMid }}>
              {t("hallHire.successCta")}
            </button>
          </div>
        ) : (
          <div className="hall-hire-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>

            {/* ── Date calendar ── */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <button onClick={prevMonth} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 0, padding: "6px 14px", cursor: "pointer", fontFamily: body, fontSize: 13 }}>←</button>
                <span style={{ fontFamily: headingFont, fontSize: 17, color: C.textDark, letterSpacing: 1 }}>{MONTHS[month]} {year}</span>
                <button onClick={nextMonth} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 0, padding: "6px 14px", cursor: "pointer", fontFamily: body, fontSize: 13 }}>→</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                {DAYS.map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: C.textLight, fontFamily: body, padding: "4px 0" }}>{d}</div>
                ))}
                {cells.map((day, i) => {
                  if (!day) return <div key={i}/>;
                  const status = getDateStatus(day);
                  const iso = toISO(year, month, day);
                  const isSelected = iso === form.date;
                  const slots = blockedSlots[iso] || [];
                  const mornBooked = slots.includes("morning");
                  const aftnBooked = slots.includes("afternoon");
                  const bg = isSelected ? C.maroon
                    : status === "booked"  ? "rgba(192,57,43,0.15)"
                    : status === "pending" ? "rgba(216,167,55,0.15)"
                    : status === "past"    ? C.cream
                    : C.white;
                  const color = isSelected ? C.white
                    : status === "booked"  ? C.red
                    : status === "pending" ? "#b8911f"
                    : status === "past"    ? C.textLight
                    : C.textDark;
                  const canClick = status === "available" || status === "pending";
                  return (
                    <div
                      key={i}
                      onClick={() => canClick && handleSelectDay(day)}
                      style={{
                        aspectRatio: "1", display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "flex-start",
                        background: bg, color, fontSize: 11, fontFamily: body,
                        cursor: canClick ? "pointer" : "default",
                        border: `1px solid ${isSelected ? C.maroon : C.border}`,
                        fontWeight: isSelected ? 700 : 400,
                        overflow: "hidden", position: "relative", paddingTop: 4,
                      }}
                    >
                      {(mornBooked || aftnBooked) && !isSelected && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", pointerEvents: "none" }}>
                          <div style={{ flex: 1, background: mornBooked ? "rgba(192,57,43,0.15)" : "transparent" }}/>
                          <div style={{ flex: 1, background: aftnBooked ? "rgba(192,57,43,0.15)" : "transparent" }}/>
                        </div>
                      )}
                      <span style={{ position: "relative", zIndex: 1 }}>{day}</span>
                      {(mornBooked || aftnBooked) && !isSelected && (
                        <div style={{ fontSize: 7, color: C.red, fontWeight: 700, position: "relative", zIndex: 1, lineHeight: 1 }}>
                          {mornBooked && aftnBooked ? "FULL" : mornBooked ? "AM" : "PM"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  ["Available", C.white,                   C.textDark],
                  ["Selected",  C.maroon,                  C.white],
                  ["Pending",   "rgba(216,167,55,0.15)",   "#b8911f"],
                  ["Booked",    "rgba(192,57,43,0.1)",     C.red],
                ].map(([label, bg]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 12, height: 12, background: bg, border: `1px solid ${C.border}` }}/>
                    <span style={{ fontSize: 10, color: C.textLight, fontFamily: body }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Enquiry form ── */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: 28 }}>
              <form onSubmit={handleSubmit}>
                <div className="hire-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Your Name *</label>
                    <input
                      style={{ ...inputStyle, borderColor: errors.name ? C.red : C.border }}
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Full name"
                    />
                    {errors.name && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.name}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input
                      type="email"
                      style={{ ...inputStyle, borderColor: errors.email ? C.red : C.border }}
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                    {errors.email && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.email}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input
                      style={inputStyle}
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="0412 345 678"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Preferred Date *</label>
                    <input
                      type="date"
                      style={{ ...inputStyle, borderColor: errors.date ? C.red : C.border }}
                      value={form.date}
                      min={today.toISOString().split("T")[0]}
                      onChange={e => {
                        setForm(p => ({ ...p, date: e.target.value }));
                        setErrors(err => ({ ...err, date: undefined }));
                      }}
                    />
                    {errors.date && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.date}</span>}
                    {!form.date && !errors.date && (
                      <div style={{ fontSize: 11, color: C.textLight, fontFamily: body, marginTop: 3 }}>Or click a date on the calendar</div>
                    )}
                  </div>
                </div>

                {!isLoggedIn && (
                  <div style={{ background: C.goldMuted, border: `1px solid ${C.goldLight}`, padding: "10px 14px", marginBottom: 14, fontSize: 12, fontFamily: body, color: C.textMid }}>
                    {t("hallHire.signInPromptIntro")} <strong>{MEMBER_DISCOUNT_PERCENT}%</strong>{t("hallHire.signInPromptDiscount")}{" "}
                    <Link to="/login" style={{ color: C.maroon, fontWeight: 700, textDecoration: "underline" }}>{t("hallHire.signInLink")}</Link>
                    {" "}{t("hallHire.signInPromptOr")}{" "}
                    <Link to="/signup" style={{ color: C.maroon, fontWeight: 700, textDecoration: "underline" }}>{t("hallHire.signUpLink")}</Link>
                    {" "}{t("hallHire.signInPromptOutro")}
                  </div>
                )}
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Booking Type *</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {slotsForDate.map(slotKey => {
                      const slot = HALL_SLOTS[slotKey];
                      const pricing = getPriceForBooking({ slot: slotKey, isMember });
                      return (
                        <label
                          key={slotKey}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            gap: 8, cursor: "pointer",
                            padding: "9px 14px",
                            border: `1px solid ${form.slot === slotKey ? C.maroon : C.border}`,
                            background: form.slot === slotKey ? "rgba(140,26,17,0.06)" : C.white,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="radio"
                              name="slot"
                              value={slotKey}
                              checked={form.slot === slotKey}
                              onChange={() => setForm(p => ({ ...p, slot: slotKey }))}
                              style={{ accentColor: C.maroon }}
                            />
                            <span style={{ fontSize: 13, fontFamily: body, color: C.textDark }}>{slot.label}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                            {isMember ? (
                              <>
                                <span style={{ fontSize: 12, fontFamily: body, color: C.textLight, textDecoration: "line-through" }}>${pricing.fullPrice}</span>
                                <span style={{ fontSize: 13, fontFamily: body, color: C.green, fontWeight: 700 }}>${pricing.memberPrice}</span>
                              </>
                            ) : (
                              <>
                                <span style={{ fontSize: 13, fontFamily: body, color: C.textDark, fontWeight: 600 }}>${pricing.fullPrice}</span>
                                <span style={{ fontSize: 11, fontFamily: body, color: "#b8911f" }}>Members save ${pricing.discountAmount}</span>
                              </>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="hire-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Occasion / Event Type *</label>
                    <input
                      style={{ ...inputStyle, borderColor: errors.eventType ? C.red : C.border }}
                      value={form.eventType}
                      onChange={e => setForm(p => ({ ...p, eventType: e.target.value }))}
                      placeholder="e.g. Birthday, Wedding, Meeting"
                    />
                    {errors.eventType && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.eventType}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>Expected Guests *</label>
                    <input
                      type="number"
                      min={1}
                      max={150}
                      style={{ ...inputStyle, borderColor: errors.guests ? C.red : C.border }}
                      value={form.guests}
                      onChange={e => setForm(p => ({ ...p, guests: e.target.value }))}
                      placeholder="How many guests?"
                    />
                    {errors.guests && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.guests}</span>}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Additional Notes</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
                    value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Any special requirements, layout preferences, equipment needs…"
                  />
                </div>

                {form.date && form.slot && (() => {
                  const pricing = getPriceForBooking({ slot: form.slot, isMember });
                  const slot = HALL_SLOTS[form.slot];
                  return (
                    <div style={{ border: `1px solid ${C.border}`, marginBottom: 16, overflow: "hidden" }}>
                      <div style={{ background: C.maroon, padding: "8px 14px", fontSize: 11, fontWeight: 700, color: C.white, fontFamily: body, letterSpacing: 0.5, textTransform: "uppercase" }}>
                        {t("hallHire.bookingSummary")}
                      </div>
                      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8, fontFamily: body, fontSize: 13 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: C.textMid }}>
                          <span>Date</span><span style={{ fontWeight: 600, color: C.textDark }}>{form.date}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: C.textMid }}>
                          <span>Slot</span><span style={{ fontWeight: 600, color: C.textDark }}>{slot.start} – {slot.end}</span>
                        </div>
                        {isMember && (
                          <div style={{ display: "flex", justifyContent: "space-between", color: C.textLight }}>
                            <span>{t("hallHire.memberDiscount")} ({MEMBER_DISCOUNT_PERCENT}%)</span>
                            <span style={{ color: C.green }}>−${pricing.discountAmount}</span>
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${C.border}`, paddingTop: 8, fontWeight: 700, color: C.textDark }}>
                          <span>{t("hallHire.total")}</span>
                          <span>${pricing.appliedPrice}</span>
                        </div>
                        <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{t("hallHire.noPaymentNow")}</div>
                      </div>
                    </div>
                  );
                })()}
                <div style={{ background: C.goldMuted, border: `1px solid ${C.goldLight}`, padding: "10px 14px", marginBottom: 16, fontSize: 12, fontFamily: body, color: C.textMid }}>
                  💡 {t("hallHire.capacityNote")}
                </div>

                <button
                  type="submit"
                  className="cal-hire-submit"
                  style={{ padding: "13px 32px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: body }}
                >
                  Submit Hall Hire Enquiry
                </button>
              </form>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
