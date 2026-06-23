import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { C, body, display } from "../theme";
import { SunIcon, HomeIcon, CalIcon, BellIcon, BuildingIcon, UsersIcon, LogOutIcon, HelpIcon, DocumentIcon } from "../components/ui/Icons";
import Badge from "../components/ui/Badge";
import { useDemo } from "../context/DemoContext";
import { getPricing } from "../data/mockData";
import { canSee, TIERS } from "../lib/tiers";
import { format } from "date-fns";
import { enUS as enUSLocale, mk as mkLocale } from "date-fns/locale";
import MacoCalendar from "../components/ui/MacoCalendar";
import NotificationsBell from "../components/ui/NotificationsBell";
import NotificationPrefs from "../components/ui/NotificationPrefs";

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
function OverviewSection({ member, events, setSection, notices }) {
  const { t } = useLang();
  const upcomingEvents = events.filter(e => e.date >= new Date().toISOString().split("T")[0]).slice(0, 3);
  const recentNotices = [...notices]
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.postedAt.localeCompare(a.postedAt))
    .slice(0, 3);

  return (
    <div>
      {/* Welcome banner */}
      <div className="welcome-banner" style={{ background: `linear-gradient(135deg, ${C.maroon}, ${C.maroonDeep})`, padding: "28px 32px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: body, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Welcome back</div>
          <h2 style={{ fontFamily: display, fontSize: 26, color: C.white, letterSpacing: 1, margin: "0 0 10px" }}>{member.fullName}</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ background: C.green, color: C.white, fontSize: 11, fontWeight: 700, padding: "3px 12px", fontFamily: body, letterSpacing: 0.5 }}>
              ✓ ACTIVE MEMBER
            </span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: body }}>
              {member.planType} · Renews {member.renewalDate}
            </span>
            <span style={{
              display: "inline-block", padding: "2px 8px",
              fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
              color: C.white, background: TIERS[member.tier ?? "general"].color,
              fontFamily: body, borderRadius: 0,
            }}>
              {t(`tiers.${member.tier ?? "general"}`)}
            </span>
          </div>
        </div>
        <div className="welcome-banner-avatar" style={{ width: 64, height: 64, borderRadius: "50%", background: C.goldBright, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: C.maroonDeep, fontFamily: display }}>
          {member.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
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

      {/* Notice Board preview */}
      <SectionCard title={t("dashboard.noticesPreviewTitle")} action={<button onClick={() => setSection("notices")} style={{ fontSize: 12, color: C.maroon, background: "none", border: "none", cursor: "pointer", fontFamily: body, fontWeight: 600 }}>{t("dashboard.viewAll")}</button>}>
        {recentNotices.length === 0 && <p style={{ color: C.textLight, fontSize: 13, fontFamily: body }}>{t("dashboard.noNotices")}</p>}
        {recentNotices.map(n => (
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
    </div>
  );
}

// ─── My Profile ────────────────────────────────────────────────────────────────
function ProfileSection({ member }) {
  const { t } = useLang();
  const readStyle = { fontSize: 14, color: C.textDark, fontFamily: body, padding: "9px 0" };

  return (
    <>
      <SectionCard title="My Profile">
        <div className="profile-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
          {[
            { label: "First Name", key: "firstName" },
            { label: "Last Name", key: "lastName" },
            { label: "Email", key: "email" },
            { label: "Phone", key: "phone" },
            { label: "Date of Birth", key: "dateOfBirth" },
            { label: "Address", key: "address" },
          ].map(({ label, key }) => (
            <div key={key} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, fontFamily: body, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
              <div style={readStyle}>{member[key] || (key === "address" ? member.suburb : null) || "—"}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, fontFamily: body, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>{t("profile.membershipTier")}</div>
          <span style={{
            display: "inline-block", padding: "2px 8px",
            fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
            color: C.white, background: TIERS[member.tier ?? "general"].color,
            fontFamily: body, borderRadius: 0,
          }}>
            {t(`tiers.${member.tier ?? "general"}`)}
          </span>
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.textLight, fontFamily: body, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Family Members ({member.familyMembers?.length || 0})</div>
          {(member.familyMembers || []).length === 0
            ? <p style={{ fontSize: 13, color: C.textLight, fontFamily: body }}>No additional family members on this plan.</p>
            : (member.familyMembers || []).map((fm, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", background: C.cream, marginBottom: 8, fontSize: 13, fontFamily: body }}>
                <span style={{ color: C.textDark }}>{fm.name}</span>
                <span style={{ color: C.textLight }}>{fm.dateOfBirth || ""}</span>
              </div>
            ))
          }
        </div>
      </SectionCard>

      <p style={{ fontSize: 12, color: C.textMid, fontFamily: body, marginTop: -16, marginBottom: 24, lineHeight: 1.6 }}>
        If any of your details are incorrect, please contact an admin at{" "}
        <a href="mailto:MacedonianCommunityOfBrisbane@gmail.com" style={{ color: C.maroon, textDecoration: "none" }}>
          MacedonianCommunityOfBrisbane@gmail.com
        </a>{" "}
        to have them updated.
      </p>
    </>
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


// ─── Member Event Popover ─────────────────────────────────────────────────────

function MemberEventPopover({ event, position, onClose, rsvps, toggleRsvp }) {
  const popoverRef = useRef(null);
  const { t, lang, cyrillicDisplay } = useLang();
  const [hovRsvp, setHovRsvp] = useState(false);

  useEffect(() => {
    function handleOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose]);

  const going = rsvps[event.id];
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
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body, marginBottom: 3 }}>
              {t("calendar.popover.description")}
            </div>
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, fontFamily: body, margin: 0 }}>
              {event.description}
            </p>
          </div>
        )}

        <div style={{ paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <button
            onClick={() => toggleRsvp(event.id)}
            onMouseEnter={() => setHovRsvp(true)}
            onMouseLeave={() => setHovRsvp(false)}
            style={{
              width: "100%",
              padding: "9px 0",
              background: hovRsvp ? C.maroonDark : C.maroon,
              color: C.cream,
              border: "none",
              borderRadius: 0,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: body,
              transition: "background 0.15s",
            }}
          >
            {going ? t("calendar.member.going") : t("calendar.member.notGoing")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function CalendarSection({ events, rsvps, toggleRsvp }) {
  const [popover, setPopover] = useState(null); // { event, x, y }

  const rbcEvents = events.map(e => ({
    ...e,
    start: parseEventDate(e.date, e.time),
    end:   parseEventDate(e.date, e.endTime || e.time),
  }));

  const handleSelectEvent = (event, nativeEvent) => {
    const POPOVER_W = 320;
    const POPOVER_H = 380;
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

  return (
    <SectionCard title="Community Calendar">
      <MacoCalendar
        events={rbcEvents}
        categoryColors={categoryColors}
        onSelectEvent={handleSelectEvent}
      />

      {popover && (
        <MemberEventPopover
          event={popover.event}
          position={{ x: popover.x, y: popover.y }}
          onClose={() => setPopover(null)}
          rsvps={rsvps}
          toggleRsvp={toggleRsvp}
        />
      )}
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
function HallHireSection() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { hallHireBookings, currentMember: member } = useDemo();

  const myBookings = hallHireBookings.filter(b => b.memberId === member.id || b.name === member.fullName);
  const statusColor = { pending: "#b8911f", approved: C.green, declined: C.red };
  const statusBg = { pending: "rgba(216,167,55,0.1)", approved: C.greenLight, declined: "rgba(192,57,43,0.08)" };

  return (
    <SectionCard title={t("hallHire.memberCtaTitle")}>
      <p style={{ fontSize: 14, color: C.textMid, fontFamily: body, lineHeight: 1.7, marginBottom: 20 }}>
        {t("hallHire.memberCtaBody")}
      </p>
      <button
        onClick={() => navigate("/hall-hire")}
        style={{ padding: "12px 28px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: body }}
      >
        {t("hallHire.memberCtaButton")}
      </button>

      <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, fontFamily: body, marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {t("hallHire.yourBookings")}
        </div>
        {myBookings.length === 0 ? (
          <p style={{ color: C.textLight, fontSize: 13, fontFamily: body }}>{t("hallHire.noBookings")}</p>
        ) : (
          myBookings.map(b => (
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
        )}
      </div>
    </SectionCard>
  );
}

function ContactCard({ admin }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.maroon, fontFamily: body, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>
          {admin.adminPosition}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.textDark, fontFamily: body }}>
          {admin.fullName}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontFamily: body, alignItems: "flex-end", textAlign: "right" }}>
        {admin.phone && (
          <a href={`tel:${admin.phone.replace(/\s/g, "")}`} style={{ color: C.textDark, textDecoration: "none" }}>
            📞 {admin.phone}
          </a>
        )}
        {admin.email && (
          <a href={`mailto:${admin.email}`} style={{ color: C.textDark, textDecoration: "none" }}>
            ✉️ {admin.email}
          </a>
        )}
      </div>
    </div>
  );
}

const POSITION_ORDER = ["President", "Vice President", "Secretary", "Treasurer", "Committee Member"];

function HelpSection({ members }) {
  const { t } = useLang();
  const admins = [...members.filter((m) => m.adminPosition)].sort(
    (a, b) => POSITION_ORDER.indexOf(a.adminPosition) - POSITION_ORDER.indexOf(b.adminPosition)
  );
  return (
    <SectionCard title={t("help.title")}>
      <p style={{ fontSize: 14, color: C.textMid, fontFamily: body, lineHeight: 1.7, marginBottom: 24 }}>
        {t("help.intro")}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {admins.map((admin) => (
          <ContactCard key={admin.id} admin={admin} />
        ))}
      </div>
      <div style={{ marginTop: 28, padding: "14px 16px", background: C.cream, border: `1px solid ${C.border}`, fontSize: 13, color: C.textMid, fontFamily: body }}>
        {t("help.generalEnquiries")}
      </div>
    </SectionCard>
  );
}

function ConstitutionSection() {
  const { t } = useLang();
  return (
    <SectionCard title={t("constitution.title")}>
      <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, marginBottom: 24, fontStyle: "italic" }}>
        {t("constitution.lastUpdated")}: TBC
      </div>
      <div style={{ background: C.cream, border: `1px solid ${C.border}`, padding: "32px 24px", textAlign: "center", fontFamily: body }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📜</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.textDark, marginBottom: 6 }}>
          {t("constitution.placeholderTitle")}
        </div>
        <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, maxWidth: 380, margin: "0 auto 20px" }}>
          {t("constitution.placeholderBody")}
        </div>
        <button
          disabled
          title={t("constitution.downloadComingSoon")}
          style={{ padding: "10px 22px", background: C.cream, color: C.textLight, border: `1px solid ${C.border}`, borderRadius: 0, fontSize: 13, fontWeight: 600, fontFamily: body, cursor: "not-allowed", opacity: 0.7 }}
        >
          ↓ {t("constitution.downloadButton")}
        </button>
      </div>
    </SectionCard>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────
function NotificationsSection({ member, updateNotificationPrefs }) {
  const { t } = useLang();
  return (
    <SectionCard title={t("notifications.pageTitle")}>
      <NotificationPrefs
        categories={[{ key: "events" }, { key: "noticeboard" }]}
        prefs={member.notificationPrefs}
        onToggle={(cat, channel, val) => updateNotificationPrefs(member.id, cat, channel, val)}
        contactInfo={{ email: member.email, phone: member.phone }}
      />
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
  { key: "help", icon: <HelpIcon/>, label: "Help" },
  { key: "constitution", icon: <DocumentIcon/>, label: "Constitution" },
  { key: "notifications", icon: <BellIcon/>, label: "Notifications" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MemberDashboard() {
  const navigate = useNavigate();
  const { currentMember, updateMember, events, notices, rsvps, toggleRsvp, setRole, notifications, dismissNotification, clearNotifications, members, updateNotificationPrefs } = useDemo();
  const [section, setSection] = useState("overview");
  const { lang, setLang } = useLang();

  const member = currentMember;
  const memberTier = currentMember?.tier ?? "general";
  const visibleEvents = events.filter(e => {
    const v = e.visibility;
    if (Array.isArray(v)) return v.includes(memberTier);
    return canSee(memberTier, v ?? "general");
  });
  const visibleNotifications = notifications.filter(n =>
    !n.visibility || canSee(memberTier, n.visibility)
  );

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
          <Link to="/" className="topbar-home-link" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span style={{ color: C.goldBright }}><SunIcon s={20}/></span>
            <span className="nav-brand-name topbar-title" style={{ color: C.white, fontWeight: 700, fontSize: 14, fontFamily: display, letterSpacing: 1 }}>Macedonian Community of Brisbane</span>
          </Link>
          <span className="member-top-nav-subtitle" style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginLeft: 8, padding: "3px 10px", background: "rgba(255,255,255,0.08)", fontWeight: 600, fontFamily: body }}>
            Member Portal
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button onClick={() => setLang("en")} style={{ background: "none", border: "none", borderRadius: 0, cursor: "pointer", fontFamily: body, fontSize: 12, fontWeight: lang === "en" ? 700 : 500, color: lang === "en" ? C.goldBright : "rgba(255,255,255,0.4)", padding: "4px 8px" }}>EN</button>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, userSelect: "none" }}>·</span>
            <button onClick={() => setLang("mk")} style={{ background: "none", border: "none", borderRadius: 0, cursor: "pointer", fontFamily: body, fontSize: 12, fontWeight: lang === "mk" ? 700 : 500, color: lang === "mk" ? C.goldBright : "rgba(255,255,255,0.4)", padding: "4px 8px" }}>MK</button>
          </div>
          <NotificationsBell notifications={visibleNotifications} onDismiss={dismissNotification} onClearAll={clearNotifications} prefs={currentMember?.notificationPrefs} memberId={currentMember?.id}/>
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
          {section === "overview" && <OverviewSection member={member} events={visibleEvents} setSection={setSection} notices={notices}/>}
          {section === "profile" && <ProfileSection member={member}/>}
          {section === "membership" && <MembershipSection member={member} updateMember={updateMember}/>}
          {section === "calendar" && <CalendarSection events={visibleEvents} rsvps={rsvps} toggleRsvp={toggleRsvp}/>}
          {section === "notices" && <NoticeBoardSection notices={notices}/>}
          {section === "hallhire" && <HallHireSection/>}
          {section === "help" && <HelpSection members={members}/>}
          {section === "constitution" && <ConstitutionSection/>}
          {section === "notifications" && <NotificationsSection member={member} updateNotificationPrefs={updateNotificationPrefs}/>}
        </div>
      </div>
    </div>
  );
}
