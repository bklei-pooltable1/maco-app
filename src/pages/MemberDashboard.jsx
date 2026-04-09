import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, body, display } from "../theme";
import { SunIcon, HomeIcon, CalIcon, BellIcon, BuildingIcon, UsersIcon, LogOutIcon } from "../components/ui/Icons";
import Badge from "../components/ui/Badge";
import { useDemo } from "../context/DemoContext";
import { getPricing, HALL_SLOTS } from "../data/mockData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, children, action }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, marginBottom: 24 }}>
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontFamily: display, fontSize: 16, color: C.textDark, letterSpacing: 0.5, margin: 0 }}>{title}</h3>
        {action}
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewSection({ member, events, rsvps, setSection }) {
  const upcomingEvents = events.filter(e => e.date >= new Date().toISOString().split("T")[0]).slice(0, 3);
  const myRsvps = events.filter(e => rsvps[e.id]);

  return (
    <div>
      {/* Welcome banner */}
      <div className="welcome-banner" style={{ background: `linear-gradient(135deg, ${C.maroon}, ${C.maroonDeep})`, padding: "28px 32px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: body, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Welcome back</div>
          <h2 style={{ fontFamily: display, fontSize: 26, color: C.white, letterSpacing: 1, margin: "0 0 10px" }}>{member.fullName}</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ background: C.green, color: C.white, fontSize: 11, fontWeight: 700, padding: "3px 12px", fontFamily: body, letterSpacing: 0.5 }}>
              ✓ ACTIVE MEMBER
            </span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: body }}>
              {member.planType} · Renews {member.renewalDate}
            </span>
          </div>
        </div>
        <div className="welcome-banner-avatar" style={{ width: 64, height: 64, borderRadius: "50%", background: C.goldBright, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: C.maroonDeep, fontFamily: display }}>
          {member.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Quick stats */}
      <div className="stats-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "My RSVPs", value: myRsvps.length, color: C.maroon },
          { label: "Family Members", value: member.familySize, color: C.green },
          { label: "Days Until Renewal", value: Math.max(0, Math.round((new Date(member.renewalDate) - new Date()) / (1000 * 60 * 60 * 24))), color: "#1a7fbf" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: C.white, border: `1px solid ${C.border}`, padding: "20px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: display, fontSize: 32, color, marginBottom: 6 }}>{value}</div>
            <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming events */}
      <SectionCard title="Upcoming Events" action={<button onClick={() => setSection("calendar")} style={{ fontSize: 12, color: C.maroon, background: "none", border: "none", cursor: "pointer", fontFamily: body, fontWeight: 600 }}>View all →</button>}>
        {upcomingEvents.length === 0 && <p style={{ color: C.textLight, fontSize: 13, fontFamily: body }}>No upcoming events.</p>}
        {upcomingEvents.map((e) => (
          <div key={e.id} style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 16, marginBottom: 16, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ minWidth: 48, background: C.cream, border: `1px solid ${C.border}`, padding: "8px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.maroon, textTransform: "uppercase", fontFamily: body }}>{e.dateDisplay.split(" ")[0]}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.maroonDark, fontFamily: display }}>{e.dateDisplay.split(" ")[1]}</div>
              <div style={{ fontSize: 9, color: C.textLight, fontFamily: body }}>{e.day}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, fontFamily: body }}>{e.title}</div>
              <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, marginTop: 3 }}>{e.time} · {e.location?.split(",")[0]}</div>
              <div style={{ marginTop: 8 }}><Badge>{e.category}</Badge></div>
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

// ─── My Profile ────────────────────────────────────────────────────────────────
function ProfileSection({ member, updateMember }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...member });
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateMember(member.id, { ...form, fullName: `${form.firstName} ${form.lastName}` });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 0, fontSize: 13, fontFamily: body, color: C.textDark, background: C.white, boxSizing: "border-box" };
  const readStyle = { fontSize: 14, color: C.textDark, fontFamily: body, padding: "9px 0" };

  return (
    <SectionCard title="My Profile" action={
      editing
        ? <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setEditing(false)} style={{ padding: "7px 16px", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 0, fontSize: 12, cursor: "pointer", fontFamily: body }}>Cancel</button>
            <button onClick={save} style={{ padding: "7px 16px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: body }}>Save Changes</button>
          </div>
        : <button onClick={() => setEditing(true)} style={{ padding: "7px 16px", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 0, fontSize: 12, cursor: "pointer", fontFamily: body, color: C.textDark }}>Edit Profile</button>
    }>
      {saved && <div style={{ background: C.greenLight, color: C.green, padding: "10px 14px", fontSize: 13, fontFamily: body, marginBottom: 16 }}>Profile updated successfully</div>}
      <div className="profile-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
        {[
          { label: "First Name", key: "firstName" },
          { label: "Last Name", key: "lastName" },
          { label: "Email", key: "email", type: "email" },
          { label: "Phone", key: "phone" },
          { label: "Date of Birth", key: "dateOfBirth", type: "date" },
          { label: "Suburb", key: "suburb" },
        ].map(({ label, key, type = "text" }) => (
          <div key={key} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, fontFamily: body, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
            {editing
              ? <input type={type} style={inputStyle} value={form[key] || ""} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}/>
              : <div style={readStyle}>{member[key] || "—"}</div>
            }
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.textLight, fontFamily: body, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Family Members ({member.familyMembers?.length || 0})</div>
        {(member.familyMembers || []).length === 0
          ? <p style={{ fontSize: 13, color: C.textLight, fontFamily: body }}>No additional family members on this plan.</p>
          : (member.familyMembers || []).map((fm, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", background: C.cream, marginBottom: 8, fontSize: 13, fontFamily: body }}>
              <span style={{ color: C.textDark }}>{fm.name}</span>
              <span style={{ color: C.textLight }}>Age {fm.age}</span>
            </div>
          ))
        }
      </div>
    </SectionCard>
  );
}

// ─── My Membership ─────────────────────────────────────────────────────────────
function MembershipSection({ member, updateMember }) {
  const [billing, setBilling] = useState(member.billingCycle || "yearly");
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const price = billing === "yearly" ? member.yearlyPrice : member.monthlyPrice;

  const switchBilling = (cycle) => {
    setBilling(cycle);
    updateMember(member.id, { billingCycle: cycle });
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel your membership? You'll retain access until your renewal date.")) {
      setCancelled(true);
      updateMember(member.id, { status: "cancelled" });
    }
  };

  return (
    <SectionCard title="My Membership">
      <div className="membership-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ border: `2px solid ${C.maroon}`, padding: "20px 24px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: C.textLight, fontFamily: body, textTransform: "uppercase", marginBottom: 8 }}>Current Plan</div>
          <div style={{ fontFamily: display, fontSize: 22, color: C.maroon, marginBottom: 6 }}>{member.planType}</div>
          <div style={{ fontFamily: display, fontSize: 28, color: C.textDark }}>${price}<span style={{ fontSize: 14, color: C.textLight, fontFamily: body }}>/{billing === "yearly" ? "yr" : "mo"}</span></div>
        </div>
        <div style={{ border: `1px solid ${C.border}`, padding: "20px 24px", background: C.cream }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: C.textLight, fontFamily: body, textTransform: "uppercase", marginBottom: 8 }}>Details</div>
          {[
            ["Status", member.status === "active" ? "Active" : "Cancelled", member.status === "active" ? "green" : "red"],
            ["Members", member.familySize, ""],
            ["Renewal Date", member.renewalDate, ""],
            ["Payment", member.paymentMethod || "Stripe", ""],
          ].map(([k, v, color]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontFamily: body }}>
              <span style={{ color: C.textLight }}>{k}</span>
              <span style={{ color: color === "green" ? C.green : color === "red" ? C.red : C.textDark, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, fontFamily: body, marginBottom: 12 }}>Billing Cycle</div>
        <div style={{ display: "flex", border: `1px solid ${C.border}`, overflow: "hidden", width: "fit-content" }}>
          {["monthly", "yearly"].map((b) => (
            <button key={b} onClick={() => switchBilling(b)} style={{ padding: "9px 24px", border: "none", borderRadius: 0, cursor: "pointer", fontFamily: body, fontWeight: 600, fontSize: 12,
              background: billing === b ? C.maroon : C.white, color: billing === b ? C.white : C.textMid }}>
              {b === "yearly" ? `Yearly — $${member.yearlyPrice}/yr` : `Monthly — $${member.monthlyPrice}/mo`}
            </button>
          ))}
        </div>
        {billing === "yearly" && (
          <div style={{ fontSize: 12, color: C.green, fontFamily: body, marginTop: 8 }}>
            ✓ You're saving ${Math.round(member.monthlyPrice * 12 - member.yearlyPrice)}/year on the annual plan
          </div>
        )}
      </div>

      {/* Add Family Member Section */}
      <AddFamilyMemberSection member={member} updateMember={updateMember}/>

      {cancelled
        ? <div style={{ background: "rgba(192,57,43,0.08)", border: `1px solid ${C.red}`, padding: "12px 16px", fontSize: 13, color: C.red, fontFamily: body, marginTop: 16 }}>
            Your membership has been cancelled. You'll retain access until {member.renewalDate}.
          </div>
        : <button onClick={handleCancel} style={{ background: "none", border: `1px solid ${C.border}`, padding: "10px 20px", fontSize: 12, color: C.textLight, cursor: "pointer", fontFamily: body, borderRadius: 0, marginTop: 8 }}>
            Cancel Membership
          </button>
      }
    </SectionCard>
  );
}

// ─── Add Family Member ────────────────────────────────────────────────────────
function AddFamilyMemberSection({ member, updateMember }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", dateOfBirth: "" });
  const [confirming, setConfirming] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentSize = member.familySize;
  const newSize = currentSize + 1;
  const currentPricing = getPricing(currentSize);
  const newPricing = getPricing(newSize);
  const priceDiff = newPricing.yearlyPrice - currentPricing.yearlyPrice;

  const handleConfirm = () => {
    const updatedFamilyMembers = [...(member.familyMembers || []), { name: form.name, dateOfBirth: form.dateOfBirth }];
    updateMember(member.id, {
      familySize: newSize,
      familyMembers: updatedFamilyMembers,
      planType: newPricing.label,
      yearlyPrice: newPricing.yearlyPrice,
      monthlyPrice: newPricing.monthlyPrice,
    });
    setShowForm(false);
    setConfirming(false);
    setForm({ name: "", dateOfBirth: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ marginBottom: 24, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, fontFamily: body, marginBottom: 10 }}>Family Members</div>

      {saved && (
        <div style={{ background: C.greenLight, border: `1px solid ${C.green}`, color: C.green, padding: "10px 14px", fontSize: 13, fontFamily: body, marginBottom: 12 }}>
          ✓ Family member added successfully
        </div>
      )}

      {/* Current family members */}
      {(member.familyMembers || []).map((fm, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", background: C.cream, marginBottom: 6, fontSize: 13, fontFamily: body }}>
          <span style={{ color: C.textDark }}>{fm.name}</span>
          <span style={{ color: C.textLight }}>{fm.dateOfBirth || (fm.age ? `Age ${fm.age}` : "—")}</span>
        </div>
      ))}
      {(member.familyMembers || []).length === 0 && (
        <p style={{ fontSize: 13, color: C.textLight, fontFamily: body, marginBottom: 10 }}>No additional members on this plan.</p>
      )}

      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{ marginTop: 8, padding: "9px 18px", background: C.cream, border: `1px solid ${C.border}`, borderRadius: 0, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: body, color: C.textDark }}>
          + Add Family Member
        </button>
      ) : confirming ? (
        <div style={{ marginTop: 12, border: `1px solid ${C.border}`, padding: 18, background: C.cream }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, fontFamily: body, marginBottom: 12 }}>Confirm Adding {form.name}</div>
          <div style={{ background: "rgba(216,167,55,0.12)", border: `1px solid #D8A737`, padding: "12px 14px", marginBottom: 16, fontSize: 13, fontFamily: body }}>
            <div style={{ fontWeight: 600, color: C.textDark, marginBottom: 4 }}>Price Change Notice</div>
            <div style={{ color: C.textMid }}>
              Your membership will change from <strong>{currentPricing.label}</strong> (${currentPricing.yearlyPrice}/yr) to <strong>{newPricing.label}</strong> (${newPricing.yearlyPrice}/yr).
            </div>
            {priceDiff > 0 && (
              <div style={{ color: C.textMid, marginTop: 4 }}>
                That's an additional <strong>${priceDiff}/year</strong> (prorated on your next renewal).
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setConfirming(false)} style={{ padding: "10px 20px", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 0, fontSize: 13, cursor: "pointer", fontFamily: body, color: C.textMid }}>Go Back</button>
            <button onClick={handleConfirm} style={{ padding: "10px 24px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: body }}>Confirm — Add Member</button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 12, border: `1px solid ${C.border}`, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, fontFamily: body, marginBottom: 14 }}>New Family Member Details</div>
          <div className="modal-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textLight, fontFamily: body, marginBottom: 5, textTransform: "uppercase" }}>Full Name *</label>
              <input style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 0, fontSize: 13, fontFamily: body, color: C.textDark, background: C.white, boxSizing: "border-box" }} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name"/>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textLight, fontFamily: body, marginBottom: 5, textTransform: "uppercase" }}>Date of Birth *</label>
              <input type="date" style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 0, fontSize: 13, fontFamily: body, color: C.textDark, background: C.white, boxSizing: "border-box" }} value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))}/>
            </div>
          </div>
          {/* Price preview */}
          <div style={{ background: C.goldMuted, border: `1px solid ${C.goldLight}`, padding: "10px 14px", marginBottom: 14, fontSize: 12, fontFamily: body, color: C.textMid }}>
            Adding this member will change your plan from <strong>{currentPricing.label} (${currentPricing.yearlyPrice}/yr)</strong> to <strong>{newPricing.label} (${newPricing.yearlyPrice}/yr)</strong>
            {priceDiff > 0 ? ` — +$${priceDiff}/year` : ""}.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setShowForm(false); setForm({ name: "", dateOfBirth: "" }); }} style={{ padding: "9px 18px", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 0, fontSize: 12, cursor: "pointer", fontFamily: body, color: C.textMid }}>Cancel</button>
            <button onClick={() => { if (form.name && form.dateOfBirth) setConfirming(true); }} disabled={!form.name || !form.dateOfBirth} style={{ padding: "9px 20px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontSize: 12, fontWeight: 700, cursor: form.name && form.dateOfBirth ? "pointer" : "not-allowed", fontFamily: body, opacity: form.name && form.dateOfBirth ? 1 : 0.6 }}>
              Continue →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Calendar helpers (iCal / Google) ────────────────────────────────────────

function dateToICSFormat(dateStr, timeStr) {
  // dateStr: "2026-04-06", timeStr: "9:00 AM" → "20260406T090000"
  const [y, m, d] = dateStr.split("-");
  if (!timeStr) return `${y}${m}${d}T000000`;
  const [time, meridiem] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return `${y}${m}${d}T${String(hours).padStart(2, "0")}${String(minutes || 0).padStart(2, "0")}00`;
}

function buildICS(eventsArr) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Macedonian Community Brisbane//MACO//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Macedonian Community Brisbane",
    "X-WR-TIMEZONE:Australia/Brisbane",
  ];
  eventsArr.forEach(e => {
    const dtStart = dateToICSFormat(e.date, e.time);
    const dtEnd = dateToICSFormat(e.date, e.endTime);
    lines.push(
      "BEGIN:VEVENT",
      `DTSTART;TZID=Australia/Brisbane:${dtStart}`,
      `DTEND;TZID=Australia/Brisbane:${dtEnd}`,
      `SUMMARY:${e.title}`,
      `DESCRIPTION:${(e.description || "").replace(/\n/g, "\\n")}`,
      `LOCATION:${e.location || ""}`,
      `UID:${e.id}@maco-brisbane.org`,
      "END:VEVENT"
    );
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadICS(content, filename) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function googleCalUrl(e) {
  const start = dateToICSFormat(e.date, e.time);
  const end = dateToICSFormat(e.date, e.endTime);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${start}/${end}`,
    details: e.description || "",
    location: e.location || "",
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function CalendarSection({ events, rsvps, toggleRsvp }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const cells = getCalendarDays(year, month);
  const eventsThisMonth = {};
  events.forEach(e => {
    const [y, m, d] = e.date.split("-").map(Number);
    if (y === year && m - 1 === month) {
      if (!eventsThisMonth[d]) eventsThisMonth[d] = [];
      eventsThisMonth[d].push(e);
    }
  });

  const selectedISO = selectedDay ? toISO(year, month, selectedDay) : null;
  const dayEvents = selectedDay ? (eventsThisMonth[selectedDay] || []) : [];

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); setSelectedDay(null); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); setSelectedDay(null); };

  return (
    <SectionCard title="Community Calendar" action={
      <button
        onClick={() => {
          // TODO: Replace with live iCal feed URL when backend is connected
          const ics = buildICS(events);
          downloadICS(ics, "maco-calendar.ics");
        }}
        style={{ padding: "7px 14px", border: `1px solid ${C.border}`, background: C.cream, borderRadius: 0, fontSize: 12, cursor: "pointer", fontFamily: body, color: C.textMid, fontWeight: 600 }}
      >
        ↓ Subscribe (.ics)
      </button>
    }>
      <div className="calendar-layout" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        {/* Calendar grid */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button onClick={prevMonth} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 0, padding: "6px 14px", cursor: "pointer", fontFamily: body, fontSize: 13, color: C.textMid }}>←</button>
            <span style={{ fontFamily: display, fontSize: 18, color: C.textDark, letterSpacing: 1 }}>{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 0, padding: "6px 14px", cursor: "pointer", fontFamily: body, fontSize: 13, color: C.textMid }}>→</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: C.textLight, fontFamily: body, padding: "6px 0", letterSpacing: 0.5 }}>{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={i}/>;
              const hasEvents = eventsThisMonth[day]?.length > 0;
              const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
              const isSelected = day === selectedDay;
              return (
                <div key={i} onClick={() => setSelectedDay(day === selectedDay ? null : day)} style={{
                  aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  cursor: hasEvents ? "pointer" : "default",
                  background: isSelected ? C.maroon : isToday ? C.goldMuted : "transparent",
                  border: isToday && !isSelected ? `1px solid ${C.gold}` : "1px solid transparent",
                  position: "relative", borderRadius: 0,
                }}>
                  <span style={{ fontSize: 13, fontFamily: body, fontWeight: isToday ? 700 : 400, color: isSelected ? C.white : isToday ? C.maroon : C.textDark }}>{day}</span>
                  {hasEvents && <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                    {(eventsThisMonth[day] || []).slice(0, 3).map((e, j) => (
                      <div key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? C.white : (categoryColors[e.category] || C.maroon) }}/>
                    ))}
                  </div>}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
            {Object.entries(categoryColors).map(([cat, color]) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }}/>
                <span style={{ fontSize: 10, color: C.textLight, fontFamily: body }}>{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Event details panel */}
        <div>
          {dayEvents.length === 0
            ? <div style={{ padding: "24px", border: `1px solid ${C.border}`, background: C.cream, textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📅</div>
                <div style={{ fontSize: 13, color: C.textLight, fontFamily: body }}>Select a date with events to see details</div>
              </div>
            : dayEvents.map(e => {
                const rsvpd = rsvps[e.id];
                return (
                  <div key={e.id} style={{ border: `1px solid ${C.border}`, background: C.white, marginBottom: 12, padding: "16px 18px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: categoryColors[e.category] || C.maroon, fontFamily: body, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" }}>{e.category}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.textDark, fontFamily: body, marginBottom: 6 }}>{e.title}</div>
                    <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, marginBottom: 4 }}>🕐 {e.time} – {e.endTime}</div>
                    <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, marginBottom: 12 }}>📍 {e.location}</div>
                    <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6, fontFamily: body, marginBottom: 14 }}>{e.description}</p>
                    <button onClick={() => toggleRsvp(e.id)} style={{
                      width: "100%", padding: "9px", border: `1px solid ${rsvpd ? C.red : C.maroon}`,
                      borderRadius: 0, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: body,
                      background: rsvpd ? "rgba(192,57,43,0.06)" : C.maroon,
                      color: rsvpd ? C.red : C.white, marginBottom: 8,
                    }}>
                      {rsvpd ? "✓ RSVP'd — Remove" : "RSVP to this Event"}
                    </button>
                    {/* Calendar export buttons */}
                    <div className="cal-add-buttons" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      <button
                        onClick={() => downloadICS(buildICS([e]), `${e.title.replace(/\s+/g, "-")}.ics`)}
                        style={{ padding: "7px 6px", border: `1px solid ${C.border}`, background: C.cream, borderRadius: 0, fontSize: 11, cursor: "pointer", fontFamily: body, color: C.textMid, fontWeight: 600 }}
                      >
                        🍎 Apple Calendar
                      </button>
                      <a
                        href={googleCalUrl(e)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: "7px 6px", border: `1px solid ${C.border}`, background: C.cream, borderRadius: 0, fontSize: 11, cursor: "pointer", fontFamily: body, color: C.textMid, fontWeight: 600, textDecoration: "none", display: "block", textAlign: "center" }}
                      >
                        📅 Google Calendar
                      </a>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Notice Board ─────────────────────────────────────────────────────────────
function NoticeBoardSection({ notices }) {
  const sorted = [...notices].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.postedAt.localeCompare(a.postedAt));
  return (
    <SectionCard title="Notice Board">
      {sorted.length === 0 && <p style={{ color: C.textLight, fontSize: 13, fontFamily: body }}>No notices posted yet.</p>}
      {sorted.map(n => (
        <div key={n.id} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 20, marginBottom: 20, borderLeft: n.pinned ? `3px solid ${C.maroon}` : "none", paddingLeft: n.pinned ? 16 : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              {n.pinned && <div style={{ fontSize: 10, fontWeight: 700, color: C.maroon, fontFamily: body, letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" }}>📌 Pinned</div>}
              <div style={{ fontSize: 16, fontWeight: 600, color: C.textDark, fontFamily: body }}>{n.title}</div>
            </div>
            <span style={{ fontSize: 12, color: C.textLight, fontFamily: body, whiteSpace: "nowrap", marginLeft: 12 }}>{n.postedAt}</span>
          </div>
          <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, fontFamily: body, marginBottom: 8 }}>{n.body}</p>
          <span style={{ fontSize: 12, color: C.textLight, fontFamily: body }}>Posted by {n.author}</span>
        </div>
      ))}
    </SectionCard>
  );
}

// ─── Hall Hire ────────────────────────────────────────────────────────────────
function HallHireSection({ blockedDates, blockedSlots, addHallHireBooking, member, hallHireBookings }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ eventType: "", guests: "", notes: "", slot: "fullday" });

  const cells = getCalendarDays(year, month);
  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); setSelectedDate(null); setShowForm(false); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); setSelectedDate(null); setShowForm(false); };

  // Pending bookings
  const pendingDates = hallHireBookings.filter(b => b.status === "pending").map(b => b.date);

  const getDateStatus = (day) => {
    const iso = toISO(year, month, day);
    if (blockedDates.includes(iso)) return "booked"; // fully booked (both AM+PM)
    if (pendingDates.includes(iso)) return "pending";
    const d = new Date(year, month, day);
    if (d < today) return "past";
    // Partially booked — still "available" but some slots taken
    return "available";
  };

  // Which slots are still available for a date
  const availableSlots = (iso) => {
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
    setSelectedDate(iso);
    // Pre-select first available slot
    const slots = availableSlots(iso);
    setForm(f => ({ ...f, slot: slots[0] || "fullday" }));
    setShowForm(true);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!form.eventType || !form.guests) return;
    addHallHireBooking({
      name: member.fullName,
      email: member.email,
      phone: member.phone,
      date: selectedDate,
      dateDisplay: selectedDate,
      slot: form.slot,
      eventType: form.eventType,
      expectedGuests: parseInt(form.guests),
      notes: form.notes,
      memberId: member.id,
    });
    setSubmitted(true);
    setForm({ eventType: "", guests: "", notes: "", slot: "fullday" });
  };

  return (
    <SectionCard title="Hall Hire">
      <div style={{ marginBottom: 20, padding: "12px 16px", background: C.goldMuted, border: `1px solid ${C.gold}`, fontSize: 12, fontFamily: body, color: C.textMid }}>
        Select an available date below to submit a hire enquiry. Bookings are subject to committee approval.
        <strong style={{ color: C.textDark }}> Members receive a 20% discount.</strong>
      </div>

      <div className="hall-hire-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Calendar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button onClick={prevMonth} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 0, padding: "6px 14px", cursor: "pointer", fontFamily: body, fontSize: 13 }}>←</button>
            <span style={{ fontFamily: display, fontSize: 16, color: C.textDark }}>{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 0, padding: "6px 14px", cursor: "pointer", fontFamily: body, fontSize: 13 }}>→</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: C.textLight, fontFamily: body, padding: "4px 0" }}>{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={i}/>;
              const status = getDateStatus(day);
              const iso = toISO(year, month, day);
              const isSelected = iso === selectedDate;
              const slots = blockedSlots[iso] || [];
              const mornBooked = slots.includes("morning");
              const aftnBooked = slots.includes("afternoon");
              const bg = isSelected ? C.maroon : status === "booked" ? "rgba(192,57,43,0.15)" : status === "pending" ? "rgba(216,167,55,0.15)" : status === "past" ? C.cream : C.white;
              const color = isSelected ? C.white : status === "booked" ? C.red : status === "pending" ? "#b8911f" : status === "past" ? C.textLight : C.textDark;
              const canClick = status === "available" || status === "pending";
              return (
                <div key={i} onClick={() => handleSelectDay(day)} style={{
                  aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
                  background: bg, color, fontSize: 11, fontFamily: body,
                  cursor: canClick ? "pointer" : "default",
                  border: `1px solid ${isSelected ? C.maroon : C.border}`,
                  fontWeight: isSelected ? 700 : 400,
                  overflow: "hidden", position: "relative",
                  paddingTop: 4,
                }}>
                  {/* Half-day slot indicators */}
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
            {[["Available", C.white, C.textDark], ["Selected", C.maroon, C.white], ["Pending", "rgba(216,167,55,0.15)", "#b8911f"], ["Booked", "rgba(192,57,43,0.1)", C.red]].map(([label, bg, fg]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 12, height: 12, background: bg, border: `1px solid ${C.border}` }}/>
                <span style={{ fontSize: 10, color: C.textLight, fontFamily: body }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking form */}
        <div>
          {!showForm && !submitted && (
            <div style={{ border: `1px dashed ${C.border}`, padding: 24, textAlign: "center", background: C.cream }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🏛️</div>
              <div style={{ fontSize: 13, color: C.textLight, fontFamily: body }}>Click an available date to submit an enquiry</div>
            </div>
          )}
          {showForm && !submitted && (
            <div style={{ border: `1px solid ${C.border}`, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, fontFamily: body, marginBottom: 16 }}>Booking Enquiry — {selectedDate}</div>

              {/* Slot selector */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textMid, fontFamily: body, marginBottom: 8 }}>Booking Slot *</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {availableSlots(selectedDate).map(slotKey => {
                    const slot = HALL_SLOTS[slotKey];
                    return (
                      <label key={slotKey} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 12px", border: `1px solid ${form.slot === slotKey ? C.maroon : C.border}`, background: form.slot === slotKey ? "rgba(140,26,17,0.05)" : C.white, fontSize: 13, fontFamily: body, color: C.textDark }}>
                        <input type="radio" name="hire-slot" value={slotKey} checked={form.slot === slotKey} onChange={() => setForm(p => ({ ...p, slot: slotKey }))} style={{ accentColor: C.maroon }}/>
                        <span style={{ fontWeight: 600 }}>{slot.label}</span>
                        <span style={{ fontSize: 11, color: C.textLight, marginLeft: "auto" }}>{slot.hours} hours</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textMid, fontFamily: body, marginBottom: 5 }}>Event Type *</label>
                <input style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 0, fontSize: 13, fontFamily: body, boxSizing: "border-box" }} value={form.eventType} onChange={e => setForm(p => ({ ...p, eventType: e.target.value }))} placeholder="e.g. Birthday, Wedding, Meeting"/>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textMid, fontFamily: body, marginBottom: 5 }}>Expected Guests *</label>
                <input style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 0, fontSize: 13, fontFamily: body, boxSizing: "border-box" }} type="number" value={form.guests} onChange={e => setForm(p => ({ ...p, guests: e.target.value }))} placeholder="How many guests?"/>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textMid, fontFamily: body, marginBottom: 5 }}>Additional Notes</label>
                <textarea style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 0, fontSize: 13, fontFamily: body, minHeight: 80, boxSizing: "border-box", resize: "vertical" }} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any special requirements?"/>
              </div>
              <button onClick={handleSubmit} style={{ width: "100%", padding: "11px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: body }}>
                Submit Enquiry
              </button>
            </div>
          )}
          {submitted && (
            <div style={{ border: `1px solid ${C.green}`, background: C.greenLight, padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.green, fontFamily: body, marginBottom: 6 }}>Enquiry Submitted!</div>
              <div style={{ fontSize: 13, color: C.textMid, fontFamily: body, marginBottom: 14 }}>Your booking request for <strong>{selectedDate}</strong> has been received. The committee will be in touch shortly.</div>
              <button onClick={() => { setShowForm(false); setSubmitted(false); setSelectedDate(null); }} style={{ padding: "8px 18px", background: "transparent", border: `1px solid ${C.green}`, borderRadius: 0, fontSize: 12, color: C.green, cursor: "pointer", fontFamily: body }}>
                Submit Another
              </button>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

// ─── My Bookings ──────────────────────────────────────────────────────────────
function MyBookingsSection({ hallHireBookings, member }) {
  const myBookings = hallHireBookings.filter(b => b.memberId === member.id || b.name === member.fullName);
  const statusColor = { pending: "#b8911f", approved: C.green, declined: C.red };
  const statusBg = { pending: "rgba(216,167,55,0.1)", approved: C.greenLight, declined: "rgba(192,57,43,0.08)" };

  return (
    <SectionCard title="My Hall Hire Bookings">
      {myBookings.length === 0
        ? <p style={{ color: C.textLight, fontSize: 13, fontFamily: body }}>No bookings submitted yet.</p>
        : myBookings.map(b => (
          <div key={b.id} className="my-booking-row" style={{ border: `1px solid ${C.border}`, padding: "16px 20px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, fontFamily: body, marginBottom: 4 }}>{b.eventType}</div>
              <div style={{ fontSize: 12, color: C.textLight, fontFamily: body }}>{b.dateDisplay} · {b.expectedGuests} guests</div>
              <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, marginTop: 2 }}>Submitted {b.submittedAt}</div>
            </div>
            <div style={{ padding: "6px 14px", background: statusBg[b.status] || C.cream, fontSize: 12, fontWeight: 700, color: statusColor[b.status] || C.textMid, fontFamily: body, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {b.status}
            </div>
          </div>
        ))
      }
    </SectionCard>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "overview", icon: <HomeIcon/>, label: "Dashboard" },
  { key: "profile", icon: <UsersIcon/>, label: "My Profile" },
  { key: "membership", icon: "💳", label: "Membership" },
  { key: "calendar", icon: <CalIcon/>, label: "Calendar" },
  { key: "notices", icon: <BellIcon/>, label: "Notice Board" },
  { key: "hallhire", icon: <BuildingIcon/>, label: "Hall Hire" },
  { key: "bookings", icon: "📋", label: "My Bookings" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MemberDashboard() {
  const navigate = useNavigate();
  const { currentMember, updateMember, events, notices, hallHireBookings, blockedDates, blockedSlots, addHallHireBooking, rsvps, toggleRsvp, setRole } = useDemo();
  const [section, setSection] = useState("overview");

  const member = currentMember;

  const handleSignOut = () => { setRole("public"); navigate("/"); };

  const initials = member?.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "??";

  return (
    <div style={{ fontFamily: body, background: C.cream, minHeight: "100vh", paddingTop: 36 }}>
      {/* Top nav */}
      <div style={{
        background: C.maroon, padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 52, borderBottom: `2px solid ${C.goldBright}`,
        position: "sticky", top: 36, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: C.goldBright }}><SunIcon s={20}/></span>
          <span className="nav-brand-name" style={{ color: C.white, fontWeight: 700, fontSize: 14, fontFamily: display, letterSpacing: 1 }}>Macedonian Community of Brisbane</span>
          <span className="member-top-nav-subtitle" style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginLeft: 8, padding: "3px 10px", background: "rgba(255,255,255,0.08)", fontWeight: 600, fontFamily: body }}>
            Member Portal
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: body, fontWeight: 500 }}>Home</button>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.goldBright, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.maroonDeep, fontFamily: body }}>
            {initials}
          </div>
          <button onClick={handleSignOut} title="Sign out" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", padding: 4 }}>
            <LogOutIcon/>
          </button>
        </div>
      </div>

      <div className="member-dashboard-layout" style={{ display: "flex" }}>
        {/* Sidebar */}
        <div className="member-dashboard-sidebar" style={{ width: 210, background: C.white, borderRight: `1px solid ${C.border}`, padding: "16px 10px", minHeight: "calc(100vh - 88px)", flexShrink: 0, position: "sticky", top: 88 }}>
          {NAV_ITEMS.map(({ key, icon, label }) => {
            const active = section === key;
            return (
              <button key={key} onClick={() => setSection(key)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                border: "none", background: active ? "rgba(140,26,17,0.08)" : "transparent",
                borderRadius: 0, width: "100%", color: active ? C.maroon : C.textMid,
                fontSize: 13, fontWeight: active ? 600 : 500, cursor: "pointer",
                textAlign: "left", fontFamily: body,
              }}>
                <span style={{ display: "flex", alignItems: "center" }}>{icon}</span> {label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="member-dashboard-content" style={{ flex: 1, padding: 28, maxWidth: 900 }}>
          {section === "overview" && <OverviewSection member={member} events={events} rsvps={rsvps} setSection={setSection}/>}
          {section === "profile" && <ProfileSection member={member} updateMember={updateMember}/>}
          {section === "membership" && <MembershipSection member={member} updateMember={updateMember}/>}
          {section === "calendar" && <CalendarSection events={events} rsvps={rsvps} toggleRsvp={toggleRsvp}/>}
          {section === "notices" && <NoticeBoardSection notices={notices}/>}
          {section === "hallhire" && <HallHireSection blockedDates={blockedDates} blockedSlots={blockedSlots} addHallHireBooking={addHallHireBooking} member={member} hallHireBookings={hallHireBookings}/>}
          {section === "bookings" && <MyBookingsSection hallHireBookings={hallHireBookings} member={member}/>}
        </div>
      </div>
    </div>
  );
}
