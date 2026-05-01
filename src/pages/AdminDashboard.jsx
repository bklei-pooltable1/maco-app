import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C, body, display } from "../theme";
import { SunIcon, PlusIcon, EditIcon, TrashIcon, LogOutIcon, BellIcon } from "../components/ui/Icons";
import { TIERS, TIER_KEYS } from "../lib/tiers";
import { POSITIONS } from "../lib/positions";
import Badge from "../components/ui/Badge";
import Toast from "../components/ui/Toast";
import { useDemo } from "../context/DemoContext";
import { ANALYTICS, getPricing, HALL_SLOTS } from "../data/mockData";
import { format } from "date-fns";
import { enUS as enUSLocale, mk as mkLocale } from "date-fns/locale";
import { useLang } from "../context/LangContext";
import MacoCalendar from "../components/ui/MacoCalendar";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const EVENT_CATEGORIES = ["Weekly Service", "Cultural Event", "Youth Program", "Social", "Holiday"];

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

function dateDisplay(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${MONTHS[parseInt(m) - 1].slice(0, 3)} ${parseInt(d)}, ${y}`;
}

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

const inputStyle = { width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 0, fontSize: 13, fontFamily: body, color: C.textDark, background: C.white, boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, color: C.textLight, fontFamily: body, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 };

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="modal-inner" style={{ background: C.white, width: "100%", maxWidth: 560, maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: C.white, zIndex: 1 }}>
          <h3 style={{ fontFamily: display, fontSize: 17, color: C.textDark, margin: 0, letterSpacing: 0.5 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.textLight, padding: "0 4px" }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Event Popover ────────────────────────────────────────────────────────────

const DATE_LOCALES = { en: enUSLocale, mk: mkLocale };

function EventPopover({ event, position, onClose, onEdit, onDelete, onNotify, categoryColors }) {
  const popoverRef = useRef(null);
  const { t, lang } = useLang();

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
            lineHeight: 1.3, fontFamily: body, wordBreak: "break-word",
          }}>
            {event.title}
          </div>
        </div>
        <span style={{
          display: "inline-block",
          padding: "3px 8px",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          color: TIERS[event.visibility ?? "general"].color,
          background: C.white,
          fontFamily: body,
          borderRadius: 0,
          flexShrink: 0,
          alignSelf: "flex-start",
          marginRight: 4,
        }}>
          {TIERS[event.visibility ?? "general"].label}
        </span>
        <button
          onClick={onClose}
          title={t("calendar.popover.close")}
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
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body, marginBottom: 3 }}>
              {t("calendar.popover.description")}
            </div>
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, fontFamily: body, margin: 0 }}>
              {event.description}
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <button
            onClick={() => onEdit(event)}
            style={{ flex: 1, padding: "8px 0", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: body, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <EditIcon/> {t("calendar.popover.edit")}
          </button>
          <button
            onClick={() => onDelete(event)}
            style={{ flex: 1, padding: "8px 0", background: "rgba(192,57,43,0.07)", color: C.red, border: `1px solid ${C.red}`, borderRadius: 0, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: body, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <TrashIcon/> {t("calendar.popover.delete")}
          </button>
        </div>
        <button
          onClick={() => {
            if (window.confirm(t("admin.events.notifyConfirm"))) {
              onNotify(event);
            }
          }}
          style={{ width: "100%", marginTop: 8, padding: "8px 0", background: "transparent", color: C.textDark, border: `1px solid ${C.gold}`, borderRadius: 0, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: body, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          <BellIcon/> {t("admin.events.notifyNow")}
        </button>
      </div>
    </div>
  );
}

// ─── notifyCommunity ─────────────────────────────────────────────────────────

function notifyCommunity({ type, event, addNotification, members, showToast, t, toastKey = "admin.events.notifyToast" }) {
  const templates = {
    event_created:   `New event added: ${event.title}`,
    event_updated:   `Event updated: ${event.title}`,
    event_deleted:   `Event cancelled: ${event.title}`,
    event_reminder:  `Reminder: ${event.title}`,
    notice_created:  `New notice posted: ${event.title}`,
    notice_updated:  `Notice updated: ${event.title}`,
    notice_deleted:  `Notice removed: ${event.title}`,
    notice_reminder: `Notice: ${event.title}`,
  };
  addNotification({
    type,
    eventId: event.id,
    eventTitle: event.title,
    message: templates[type] ?? `Event: ${event.title}`,
  });
  showToast(t(toastKey).replace("{count}", members.length));
}

// ─── DeleteEventConfirm ───────────────────────────────────────────────────────

function DeleteEventConfirm({ event, onCancel, onConfirm }) {
  const [notifyOnDelete, setNotifyOnDelete] = useState(true);
  const { t } = useLang();

  return (
    <Modal title="Delete event?" onClose={onCancel}>
      <p style={{ fontSize: 14, color: C.textMid, fontFamily: body, marginBottom: 20 }}>
        <strong style={{ color: C.textDark }}>{event.title}</strong> will be permanently deleted.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <input
          type="checkbox"
          id="notify-delete-checkbox"
          checked={notifyOnDelete}
          onChange={e => setNotifyOnDelete(e.target.checked)}
          style={{ width: 16, height: 16, cursor: "pointer", accentColor: C.maroon }}
        />
        <label htmlFor="notify-delete-checkbox" style={{ fontSize: 13, color: C.textDark, fontFamily: body, cursor: "pointer" }}>
          {t("admin.events.notifyOnDelete")}
        </label>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button onClick={onCancel} style={{ padding: "10px 20px", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 0, fontSize: 13, cursor: "pointer", fontFamily: body }}>Cancel</button>
        <button onClick={() => onConfirm(notifyOnDelete)} style={{ padding: "10px 24px", background: C.red, color: C.white, border: "none", borderRadius: 0, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: body }}>Delete</button>
      </div>
    </Modal>
  );
}

// ─── Members Tab ──────────────────────────────────────────────────────────────

function MembersTab({ members, addMember, updateMember }) {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterSuburb, setFilterSuburb] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [viewMember, setViewMember] = useState(null);
  const [editMember, setEditMember] = useState(null);

  const [newMemberForm, setNewMemberForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "", suburb: "",
    familySize: 1, planType: "Individual", paymentMethod: "Stripe", status: "active", billingCycle: "yearly",
  });

  const suburbs = [...new Set(members.map(m => m.suburb))].sort();
  const plans = [...new Set(members.map(m => m.planType))].sort();

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.suburb.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || m.status === filterStatus;
    const matchPlan = filterPlan === "all" || m.planType === filterPlan;
    const matchSuburb = filterSuburb === "all" || m.suburb === filterSuburb;
    return matchSearch && matchStatus && matchPlan && matchSuburb;
  });

  const handleAddMember = () => {
    const pricing = getPricing(newMemberForm.familySize);
    addMember({
      ...newMemberForm,
      fullName: `${newMemberForm.firstName} ${newMemberForm.lastName}`,
      familyMembers: [],
      yearlyPrice: pricing.yearlyPrice,
      monthlyPrice: pricing.monthlyPrice,
      renewalDate: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
    });
    setShowAdd(false);
    setNewMemberForm({ firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "", suburb: "", familySize: 1, planType: "Individual", paymentMethod: "Stripe", status: "active", billingCycle: "yearly" });
  };

  const statusColor = { active: "green", expired: "gold", cancelled: "red" };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Plan", "Family Size", "Suburb", "Join Date", "Renewal Date", "Status", "Payment Method"];
    const rows = members.map(m => [m.fullName, m.email, m.phone, m.planType, m.familySize, m.suburb, m.joinDate, m.renewalDate, m.status, m.paymentMethod]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "members.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="admin-member-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: display, fontSize: 20, color: C.textDark, margin: 0, letterSpacing: 0.5 }}>Member Directory</h2>
        <div className="admin-member-actions" style={{ display: "flex", gap: 10 }}>
          <button onClick={exportCSV} style={{ padding: "9px 18px", border: `1px solid ${C.border}`, background: C.white, borderRadius: 0, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: body, color: C.textMid }}>
            ↓ Export CSV
          </button>
          <button onClick={() => setShowAdd(true)} style={{ padding: "9px 18px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: body, display: "flex", alignItems: "center", gap: 6 }}>
            <PlusIcon/> Add Member
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filter-row" style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input style={{ ...inputStyle, flex: 1, minWidth: 200 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, suburb…"/>
        <select style={{ ...inputStyle, width: "auto" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select style={{ ...inputStyle, width: "auto" }} value={filterPlan} onChange={e => setFilterPlan(e.target.value)}>
          <option value="all">All Plans</option>
          {plans.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select style={{ ...inputStyle, width: "auto" }} value={filterSuburb} onChange={e => setFilterSuburb(e.target.value)}>
          <option value="all">All Suburbs</option>
          {suburbs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-scroll-container" style={{ background: C.white, border: `1px solid ${C.border}`, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: body }}>
          <thead>
            <tr style={{ background: C.cream, borderBottom: `1px solid ${C.border}` }}>
              {["Name", "Email", "Plan", "Family", "Suburb", "Joined", "Status"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: C.textMid, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m.id} onClick={() => setViewMember(m)} style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer", background: i % 2 === 0 ? C.white : C.cream }}>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ fontWeight: 600, color: C.textDark }}>{m.fullName}</div>
                  <span style={{
                    display: "inline-block", marginTop: 3, padding: "2px 8px",
                    fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
                    color: C.white, background: TIERS[m.tier ?? "general"].color,
                    fontFamily: body, borderRadius: 0,
                  }}>
                    {t(`tiers.${m.tier ?? "general"}`)}
                  </span>
                </td>
                <td style={{ padding: "11px 14px", color: C.textMid }}>{m.email}</td>
                <td style={{ padding: "11px 14px" }}><Badge>{m.planType}</Badge></td>
                <td style={{ padding: "11px 14px", color: C.textMid }}>{m.familySize}</td>
                <td style={{ padding: "11px 14px", color: C.textMid }}>{m.suburb}</td>
                <td style={{ padding: "11px 14px", color: C.textLight }}>{m.joinDate}</td>
                <td style={{ padding: "11px 14px" }}><Badge color={statusColor[m.status] || "gold"}>{m.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: 24, textAlign: "center", color: C.textLight, fontSize: 13, fontFamily: body }}>No members match your filters.</div>}
      </div>
      <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, marginTop: 8 }}>Showing {filtered.length} of {members.length} members</div>

      {/* Add Member Modal */}
      {showAdd && (
        <Modal title="Add Member" onClose={() => setShowAdd(false)}>
          <div className="modal-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[["firstName", "First Name"], ["lastName", "Last Name"], ["email", "Email"], ["phone", "Phone"], ["dateOfBirth", "Date of Birth", "date"], ["suburb", "Suburb"]].map(([key, label, type = "text"]) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input type={type} style={inputStyle} value={newMemberForm[key]} onChange={e => setNewMemberForm(p => ({ ...p, [key]: e.target.value }))}/>
              </div>
            ))}
            <div>
              <label style={labelStyle}>Family Size</label>
              <input type="number" style={inputStyle} value={newMemberForm.familySize} min={1} max={10} onChange={e => { const n = parseInt(e.target.value) || 1; setNewMemberForm(p => ({ ...p, familySize: n, planType: getPricing(n).label })); }}/>
            </div>
            <div>
              <label style={labelStyle}>Payment Method</label>
              <select style={inputStyle} value={newMemberForm.paymentMethod} onChange={e => setNewMemberForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                <option>Stripe</option><option>Bank Transfer</option><option>Cash</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={newMemberForm.status} onChange={e => setNewMemberForm(p => ({ ...p, status: e.target.value }))}>
                <option value="active">Active</option><option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Billing Cycle</label>
              <select style={inputStyle} value={newMemberForm.billingCycle} onChange={e => setNewMemberForm(p => ({ ...p, billingCycle: e.target.value }))}>
                <option value="yearly">Yearly</option><option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 8, padding: "10px 14px", background: C.goldMuted, fontSize: 13, fontFamily: body }}>
            Plan: <strong>{getPricing(newMemberForm.familySize).label}</strong> — ${getPricing(newMemberForm.familySize).yearlyPrice}/yr or ${getPricing(newMemberForm.familySize).monthlyPrice}/mo
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <button onClick={() => setShowAdd(false)} style={{ padding: "10px 20px", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 0, fontSize: 13, cursor: "pointer", fontFamily: body }}>Cancel</button>
            <button onClick={handleAddMember} style={{ padding: "10px 24px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: body }}>Add Member</button>
          </div>
        </Modal>
      )}

      {/* View/Edit Member Modal */}
      {viewMember && (
        <Modal title={viewMember.fullName} onClose={() => { setViewMember(null); setEditMember(null); }}>
          {editMember
            ? (
              <div>
                <div className="modal-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {[["firstName", "First Name"], ["lastName", "Last Name"], ["email", "Email"], ["phone", "Phone"], ["suburb", "Suburb"]].map(([key, label]) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input style={inputStyle} value={editMember[key] || ""} onChange={e => setEditMember(p => ({ ...p, [key]: e.target.value }))}/>
                    </div>
                  ))}
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select style={inputStyle} value={editMember.status} onChange={e => setEditMember(p => ({ ...p, status: e.target.value }))}>
                      <option value="active">Active</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>{t("tiers.memberTierLabel")}</label>
                    <select style={inputStyle} value={editMember.tier ?? "general"} onChange={e => setEditMember(p => ({ ...p, tier: e.target.value }))}>
                      {TIER_KEYS.map(k => (
                        <option key={k} value={k}>{t(`tiers.${k}`)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                  <button onClick={() => setEditMember(null)} style={{ padding: "10px 20px", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 0, fontSize: 13, cursor: "pointer", fontFamily: body }}>Cancel</button>
                  <button onClick={() => { updateMember(editMember.id, { ...editMember, fullName: `${editMember.firstName} ${editMember.lastName}` }); setViewMember({ ...editMember, fullName: `${editMember.firstName} ${editMember.lastName}` }); setEditMember(null); }} style={{ padding: "10px 24px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: body }}>Save</button>
                </div>
              </div>
            ) : (
              <div>
                {[
                  ["Email", viewMember.email], ["Phone", viewMember.phone], ["Date of Birth", viewMember.dateOfBirth],
                  ["Suburb", viewMember.suburb], ["Plan", viewMember.planType], ["Family Size", viewMember.familySize],
                  ["Join Date", viewMember.joinDate], ["Renewal Date", viewMember.renewalDate],
                  ["Status", viewMember.status], ["Payment", viewMember.paymentMethod], ["Billing", viewMember.billingCycle],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontFamily: body }}>
                    <span style={{ color: C.textLight, fontWeight: 600 }}>{k}</span>
                    <span style={{ color: C.textDark }}>{v}</span>
                  </div>
                ))}
                {(viewMember.familyMembers || []).length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8, fontFamily: body }}>Family Members</div>
                    {viewMember.familyMembers.map((fm, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 12px", background: C.cream, marginBottom: 6, fontSize: 13, fontFamily: body }}>
                        <span>{fm.name}</span><span style={{ color: C.textLight }}>Age {fm.age}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                  <button onClick={() => setEditMember({ ...viewMember })} style={{ padding: "10px 24px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: body }}>
                    Edit Member
                  </button>
                </div>
              </div>
            )
          }
        </Modal>
      )}
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab({ members }) {
  const active = members.filter(m => m.status === "active").length;
  const monthlyRev = members.filter(m => m.status === "active").reduce((sum, m) => sum + (m.billingCycle === "monthly" ? m.monthlyPrice : m.yearlyPrice / 12), 0);
  const yearlyRev = monthlyRev * 12;

  // Age groups
  const ageGroups = { "0–18": 0, "19–30": 0, "31–45": 0, "46–60": 0, "60+": 0 };
  members.forEach(m => {
    const age = m.age || 0;
    if (age <= 18) ageGroups["0–18"]++;
    else if (age <= 30) ageGroups["19–30"]++;
    else if (age <= 45) ageGroups["31–45"]++;
    else if (age <= 60) ageGroups["46–60"]++;
    else ageGroups["60+"]++;
  });
  const maxAge = Math.max(...Object.values(ageGroups));

  // Plan breakdown
  const planCounts = {};
  members.forEach(m => { planCounts[m.planType] = (planCounts[m.planType] || 0) + 1; });
  const planTotal = Object.values(planCounts).reduce((a, b) => a + b, 0);
  const planColors = { "Individual": C.gold, "Couple": C.maroon, "Family (3)": C.green, "Family (4)": "#1a7fbf", "Family (5)": "#7b5ea7", "Family (6+)": "#c0682b" };

  // Suburb breakdown
  const suburbCounts = {};
  members.forEach(m => { suburbCounts[m.suburb] = (suburbCounts[m.suburb] || 0) + 1; });
  const maxSuburb = Math.max(...Object.values(suburbCounts));

  // Avg family size
  const avgFamily = (members.reduce((s, m) => s + m.familySize, 0) / members.length).toFixed(1);

  const exportCSV = () => {
    const headers = ["Name", "Email", "Age", "Plan", "Family Size", "Suburb", "Status", "Billing", "Monthly Revenue"];
    const rows = members.map(m => [m.fullName, m.email, m.age, m.planType, m.familySize, m.suburb, m.status, m.billingCycle, (m.status === "active" ? (m.billingCycle === "monthly" ? m.monthlyPrice : (m.yearlyPrice / 12).toFixed(2)) : 0)]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "member-analytics.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: display, fontSize: 20, color: C.textDark, margin: 0, letterSpacing: 0.5 }}>Analytics</h2>
        <button onClick={exportCSV} style={{ padding: "9px 18px", border: `1px solid ${C.border}`, background: C.white, borderRadius: 0, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: body, color: C.textMid }}>↓ Export All Data</button>
      </div>

      {/* Metric cards */}
      <div className="analytics-stat-cards" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Members", value: members.length, color: C.maroon, prefix: "" },
          { label: "Active Subscriptions", value: active, color: C.green, prefix: "" },
          { label: "Monthly Revenue", value: `$${Math.round(monthlyRev).toLocaleString()}`, color: "#1a7fbf", prefix: "" },
          { label: "Yearly Revenue", value: `$${Math.round(yearlyRev).toLocaleString()}`, color: "#7b5ea7", prefix: "" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: C.white, border: `1px solid ${C.border}`, padding: "22px 24px" }}>
            <div style={{ fontFamily: display, fontSize: 30, color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="analytics-charts-top" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Age Distribution */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: 24 }}>
          <div style={{ fontFamily: display, fontSize: 15, color: C.textDark, marginBottom: 20, letterSpacing: 0.5 }}>Age Distribution</div>
          {Object.entries(ageGroups).map(([label, count]) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontFamily: body, color: C.textMid, fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 12, fontFamily: body, color: C.textLight }}>{count} {count === 1 ? "member" : "members"}</span>
              </div>
              <div style={{ height: 10, background: C.cream, border: `1px solid ${C.border}` }}>
                <div style={{ height: "100%", width: `${maxAge > 0 ? (count / maxAge) * 100 : 0}%`, background: C.maroon, transition: "width 0.3s" }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Plan Breakdown */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: 24 }}>
          <div style={{ fontFamily: display, fontSize: 15, color: C.textDark, marginBottom: 20, letterSpacing: 0.5 }}>Plan Breakdown</div>
          {Object.entries(planCounts).map(([plan, count]) => (
            <div key={plan} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontFamily: body, color: C.textMid, fontWeight: 600 }}>{plan}</span>
                <span style={{ fontSize: 12, fontFamily: body, color: C.textLight }}>{count} ({Math.round((count / planTotal) * 100)}%)</span>
              </div>
              <div style={{ height: 10, background: C.cream, border: `1px solid ${C.border}` }}>
                <div style={{ height: "100%", width: `${(count / planTotal) * 100}%`, background: planColors[plan] || C.maroon }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-charts-bottom" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Suburb breakdown */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: 24 }}>
          <div style={{ fontFamily: display, fontSize: 15, color: C.textDark, marginBottom: 20, letterSpacing: 0.5 }}>Members by Suburb</div>
          {Object.entries(suburbCounts).sort((a, b) => b[1] - a[1]).map(([suburb, count]) => (
            <div key={suburb} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontFamily: body, color: C.textMid, fontWeight: 600 }}>{suburb}</span>
                <span style={{ fontSize: 12, fontFamily: body, color: C.textLight }}>{count}</span>
              </div>
              <div style={{ height: 10, background: C.cream, border: `1px solid ${C.border}` }}>
                <div style={{ height: "100%", width: `${(count / maxSuburb) * 100}%`, background: C.gold }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Summary stats */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: 24 }}>
          <div style={{ fontFamily: display, fontSize: 15, color: C.textDark, marginBottom: 20, letterSpacing: 0.5 }}>Summary Statistics</div>
          {[
            ["Average Family Size", avgFamily + " people"],
            ["Active Members", `${active} of ${members.length} (${Math.round((active / members.length) * 100)}%)`],
            ["Monthly Billed", members.filter(m => m.billingCycle === "monthly").length + " members"],
            ["Yearly Billed", members.filter(m => m.billingCycle === "yearly").length + " members"],
            ["Cash/Manual Payments", members.filter(m => m.paymentMethod !== "Stripe").length + " members"],
            ["Stripe Payments", members.filter(m => m.paymentMethod === "Stripe").length + " members"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontFamily: body }}>
              <span style={{ color: C.textLight }}>{k}</span>
              <span style={{ color: C.textDark, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Events Tab ───────────────────────────────────────────────────────────────

function EventsTab({ events, addEvent, updateEvent, deleteEvent, showToast }) {
  const { addNotification, members } = useDemo();
  const { t } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({ title: "", date: "", time: "", endTime: "", category: "Weekly Service", description: "", location: "", notify: true, visibility: "general" });
  const [popover, setPopover] = useState(null); // { event, x, y }
  const [deleteTarget, setDeleteTarget] = useState(null);

  const categoryColors = {
    "Weekly Service": C.maroon,
    "Holiday": "#7b5ea7",
    "Youth Program": C.green,
    "Social": "#1a7fbf",
    "Cultural Event": "#c0682b",
  };

  const rbcEvents = events.map(e => ({
    ...e,
    start: parseEventDate(e.date, e.time),
    end:   parseEventDate(e.date, e.endTime || e.time),
  }));

  const handleSelectEvent = (event, nativeEvent) => {
    const POPOVER_W = 320;
    const POPOVER_H = 340;
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

  const handleSave = () => {
    const [, m, d] = form.date.split("-").map(Number);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const dateObj = new Date(form.date + "T12:00:00");
    const evt = { ...form, dateDisplay: `${months[m - 1]} ${d}`, day: days[dateObj.getDay()] };
    if (editingEvent) {
      updateEvent(editingEvent.id, evt);
      if (form.notify) notifyCommunity({ type: "event_updated", event: { ...evt, id: editingEvent.id }, addNotification, members, showToast, t });
      setEditingEvent(null);
    } else {
      const newEvt = addEvent(evt);
      if (form.notify) notifyCommunity({ type: "event_created", event: newEvt, addNotification, members, showToast, t });
    }
    setShowForm(false);
    setForm({ title: "", date: "", time: "", endTime: "", category: "Weekly Service", description: "", location: "", notify: true, visibility: "general" });
  };

  const startEdit = (e) => {
    setEditingEvent(e);
    setForm({ title: e.title, date: e.date, time: e.time, endTime: e.endTime || "", category: e.category, description: e.description, location: e.location || "", notify: false, visibility: e.visibility ?? "general" });
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: display, fontSize: 20, color: C.textDark, margin: 0, letterSpacing: 0.5 }}>Events Calendar</h2>
        <button
          onClick={() => { setEditingEvent(null); setForm({ title: "", date: "", time: "", endTime: "", category: "Weekly Service", description: "", location: "", notify: true, visibility: "general" }); setShowForm(true); }}
          style={{ padding: "9px 18px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: body, display: "flex", alignItems: "center", gap: 6 }}
        >
          <PlusIcon/> Add Event
        </button>
      </div>

      <MacoCalendar
        events={rbcEvents}
        categoryColors={categoryColors}
        onSelectEvent={handleSelectEvent}
      />

      {popover && (
        <EventPopover
          event={popover.event}
          position={{ x: popover.x, y: popover.y }}
          onClose={() => setPopover(null)}
          onEdit={(e) => { startEdit(e); setPopover(null); }}
          onDelete={(event) => { setDeleteTarget(event); setPopover(null); }}
          onNotify={(event) => {
            notifyCommunity({ type: "event_reminder", event, addNotification, members, showToast, t });
            setPopover(null);
          }}
          categoryColors={categoryColors}
        />
      )}

      {deleteTarget && (
        <DeleteEventConfirm
          event={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={(shouldNotify) => {
            deleteEvent(deleteTarget.id);
            if (shouldNotify) notifyCommunity({ type: "event_deleted", event: deleteTarget, addNotification, members, showToast, t });
            setDeleteTarget(null);
          }}
        />
      )}

      {showForm && (
        <Modal title={editingEvent ? "Edit Event" : "Add Event"} onClose={() => { setShowForm(false); setEditingEvent(null); }}>
          <div className="modal-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Event Name *</label>
              <input style={inputStyle} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Sunday Divine Liturgy"/>
            </div>
            <div>
              <label style={labelStyle}>Date *</label>
              <input type="date" style={inputStyle} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}/>
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {EVENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Start Time</label>
              <input style={inputStyle} value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} placeholder="9:00 AM"/>
            </div>
            <div>
              <label style={labelStyle}>End Time</label>
              <input style={inputStyle} value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} placeholder="11:00 AM"/>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Location</label>
              <input style={inputStyle} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Venue address"/>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}/>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>{t("tiers.visibilityLabel")}</label>
              <select
                style={inputStyle}
                value={form.visibility ?? "general"}
                onChange={e => setForm(p => ({ ...p, visibility: e.target.value }))}
              >
                <option value="general">{t("tiers.visibilityGeneral")}</option>
                <option value="financial">{t("tiers.visibilityFinancial")}</option>
                <option value="foundational">{t("tiers.visibilityFoundational")}</option>
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <input
                type="checkbox"
                id="notify-checkbox"
                checked={form.notify}
                onChange={e => setForm(p => ({ ...p, notify: e.target.checked }))}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: C.maroon }}
              />
              <label htmlFor="notify-checkbox" style={{ fontSize: 13, color: C.textDark, fontFamily: body, cursor: "pointer" }}>
                {editingEvent ? t("admin.events.notifyOnEdit") : t("admin.events.notifyOnCreate")}
              </label>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
            {editingEvent ? (
              <button
                onClick={() => {
                  if (window.confirm(t("admin.events.notifyConfirm"))) {
                    notifyCommunity({ type: "event_updated", event: editingEvent, addNotification, members, showToast, t });
                  }
                }}
                style={{ padding: "10px 18px", border: `1px solid ${C.gold}`, background: "transparent", borderRadius: 0, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: body, color: C.textDark }}
              >
                {t("admin.events.notifyNow")}
              </button>
            ) : <div />}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setShowForm(false); setEditingEvent(null); }} style={{ padding: "10px 20px", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 0, fontSize: 13, cursor: "pointer", fontFamily: body }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: "10px 24px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: body }}>
                {editingEvent ? "Save Changes" : "Add Event"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Notice Board Tab ─────────────────────────────────────────────────────────

function NoticeBoardTab({ notices, addNotice, updateNotice, deleteNotice, togglePinNotice, showToast }) {
  const { addNotification, members } = useDemo();
  const { t } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null); // notice being edited
  const [form, setForm] = useState({ title: "", body: "", author: "Committee", pinned: false, notify: true });

  const openNew = () => {
    setEditingNotice(null);
    setForm({ title: "", body: "", author: "Committee", pinned: false, notify: true });
    setShowForm(true);
  };

  const openEdit = (n) => {
    setEditingNotice(n);
    setForm({ title: n.title, body: n.body, author: n.author, pinned: n.pinned, notify: false });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title || !form.body) return;
    if (editingNotice) {
      updateNotice(editingNotice.id, form);
    } else {
      const newNotice = addNotice(form);
      if (form.notify) notifyCommunity({ type: "notice_created", event: newNotice, addNotification, members, showToast, t, toastKey: "admin.notices.notifyToast" });
    }
    setShowForm(false);
    setEditingNotice(null);
    setForm({ title: "", body: "", author: "Committee", pinned: false, notify: true });
  };

  const sorted = [...notices].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.postedAt?.localeCompare(a.postedAt || ""));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: display, fontSize: 20, color: C.textDark, margin: 0, letterSpacing: 0.5 }}>Notice Board</h2>
        <button onClick={openNew} style={{ padding: "9px 18px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: body, display: "flex", alignItems: "center", gap: 6 }}>
          <PlusIcon/> Post Notice
        </button>
      </div>

      {sorted.map(n => (
        <div key={n.id} style={{ background: C.white, border: `1px solid ${C.border}`, padding: "20px 24px", marginBottom: 12, borderLeft: n.pinned ? `3px solid ${C.maroon}` : "none" }}>
          <div className="notice-card-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              {n.pinned && <div style={{ fontSize: 10, fontWeight: 700, color: C.maroon, fontFamily: body, letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" }}>📌 Pinned</div>}
              <div style={{ fontSize: 16, fontWeight: 600, color: C.textDark, fontFamily: body, marginBottom: 8 }}>{n.title}</div>
              <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, fontFamily: body, marginBottom: 8 }}>{n.body}</p>
              <div style={{ fontSize: 12, color: C.textLight, fontFamily: body }}>Posted by {n.author} · {n.postedAt}</div>
            </div>
            <div className="notice-card-actions" style={{ display: "flex", gap: 8, marginLeft: 16, flexShrink: 0 }}>
              <button onClick={() => togglePinNotice(n.id)} title={n.pinned ? "Unpin" : "Pin"} style={{ background: n.pinned ? "rgba(140,26,17,0.08)" : C.cream, border: `1px solid ${C.border}`, borderRadius: 0, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontFamily: body, color: n.pinned ? C.maroon : C.textLight }}>
                {n.pinned ? "📌 Pinned" : "📌 Pin"}
              </button>
              <button onClick={() => openEdit(n)} title="Edit notice" style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 0, padding: "6px 10px", cursor: "pointer", color: C.textMid }}>
                <EditIcon/>
              </button>
              <button
                onClick={() => { if (window.confirm(t("admin.notices.notifyConfirm"))) notifyCommunity({ type: "notice_reminder", event: n, addNotification, members, showToast, t, toastKey: "admin.notices.notifyToast" }); }}
                title={t("admin.notices.notifyNow")}
                style={{ background: "transparent", border: `1px solid ${C.gold}`, borderRadius: 0, padding: "6px 10px", cursor: "pointer", color: C.textDark }}
              >
                <BellIcon/>
              </button>
              <button onClick={() => { if (window.confirm("Delete this notice?")) deleteNotice(n.id); }} title="Delete notice" style={{ background: "rgba(192,57,43,0.06)", border: "none", borderRadius: 0, padding: "6px 10px", cursor: "pointer", color: C.red }}>
                <TrashIcon/>
              </button>
            </div>
          </div>
        </div>
      ))}

      {showForm && (
        <Modal title={editingNotice ? "Edit Notice" : "Post Notice"} onClose={() => { setShowForm(false); setEditingNotice(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input style={inputStyle} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Notice title"/>
            </div>
            <div>
              <label style={labelStyle}>Body *</label>
              <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Notice content…"/>
            </div>
            <div>
              <label style={labelStyle}>Posted By</label>
              <input style={inputStyle} value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))}/>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontFamily: body, color: C.textMid, cursor: "pointer" }}>
              <input type="checkbox" checked={form.pinned} onChange={e => setForm(p => ({ ...p, pinned: e.target.checked }))}/>
              Pin this notice to the top
            </label>
            {!editingNotice && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  id="notice-notify-checkbox"
                  checked={form.notify}
                  onChange={e => setForm(p => ({ ...p, notify: e.target.checked }))}
                  style={{ width: 16, height: 16, cursor: "pointer", accentColor: C.maroon }}
                />
                <label htmlFor="notice-notify-checkbox" style={{ fontSize: 13, color: C.textDark, fontFamily: body, cursor: "pointer" }}>
                  {t("admin.notices.notifyOnCreate")}
                </label>
              </div>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <button onClick={() => { setShowForm(false); setEditingNotice(null); }} style={{ padding: "10px 20px", border: `1px solid ${C.border}`, background: "transparent", borderRadius: 0, fontSize: 13, cursor: "pointer", fontFamily: body }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: "10px 24px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: body }}>
              {editingNotice ? "Save Changes" : "Post Notice"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Hall Hire Tab ────────────────────────────────────────────────────────────

const ADMIN_SLOTS = [
  { value: "morning",   label: "Morning (9am – 1pm)",  start: "09:00", end: "13:00" },
  { value: "afternoon", label: "Afternoon (1pm – 5pm)", start: "13:00", end: "17:00" },
  { value: "fullday",   label: "Full Day (9am – 5pm)",  start: "09:00", end: "17:00" },
];

function HallHireTab({ hallHireBookings, updateBookingStatus, blockedDates, blockedSlots, addHallHireBooking }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [showCreate, setShowCreate] = useState(false);
  const [createSuccess, setCreateSuccess] = useState("");
  const [form, setForm] = useState({ date: "", slot: "fullday", bookingName: "", eventName: "", isMember: false });

  const statusColor = { pending: "#b8911f", approved: C.green, declined: C.red };
  const statusBg = { pending: "rgba(216,167,55,0.1)", approved: C.greenLight, declined: "rgba(192,57,43,0.08)" };

  const cells = getCalendarDays(year, month);
  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const bookingsByDate = {};
  hallHireBookings.forEach(b => {
    if (b.date) bookingsByDate[b.date] = b;
  });

  const availableSlots = (date) => {
    if (!date) return ADMIN_SLOTS;
    const taken = blockedSlots[date] || [];
    return ADMIN_SLOTS.filter(s => {
      if (s.value === "fullday") return taken.length === 0;
      return !taken.includes(s.value) && !taken.includes("fullday");
    });
  };

  const handleCreate = () => {
    if (!form.date || !form.bookingName || !form.eventName) return;
    const slotDef = ADMIN_SLOTS.find(s => s.value === form.slot);
    addHallHireBooking({
      name: form.bookingName,
      eventType: form.eventName,
      date: form.date,
      dateDisplay: dateDisplay(form.date),
      slot: form.slot,
      startTime: slotDef.start,
      endTime: slotDef.end,
      isMember: form.isMember,
      expectedGuests: "",
      email: "—",
      phone: "—",
      notes: `Admin-created booking. ${form.isMember ? "Member rate." : "Public rate."}`,
    });
    setCreateSuccess(`Booking created for ${dateDisplay(form.date)} — ${slotDef.label}`);
    setForm({ date: "", slot: "fullday", bookingName: "", eventName: "", isMember: false });
    setShowCreate(false);
    setTimeout(() => setCreateSuccess(""), 4000);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: display, fontSize: 20, color: C.textDark, margin: 0, letterSpacing: 0.5 }}>Hall Hire Management</h2>
        <button
          onClick={() => setShowCreate(v => !v)}
          style={{ padding: "9px 18px", background: showCreate ? C.cream : C.maroon, color: showCreate ? C.textDark : C.white, border: `1px solid ${showCreate ? C.border : C.maroon}`, borderRadius: 0, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: body }}
        >
          {showCreate ? "Cancel" : "+ Create Booking"}
        </button>
      </div>

      {createSuccess && (
        <div style={{ background: C.greenLight, border: `1px solid ${C.green}`, color: C.green, padding: "10px 14px", fontSize: 13, fontFamily: body, fontWeight: 600, marginBottom: 16 }}>
          ✓ {createSuccess}
        </div>
      )}

      {showCreate && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: "22px 24px", marginBottom: 24 }}>
          <div style={{ fontFamily: display, fontSize: 15, color: C.textDark, marginBottom: 16, letterSpacing: 0.5 }}>New Booking</div>
          <div className="admin-hall-create-form" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Booking Name *</label>
              <input style={inputStyle} value={form.bookingName} onChange={e => setForm(f => ({ ...f, bookingName: e.target.value }))} placeholder="e.g. Petrov Family"/>
            </div>
            <div>
              <label style={labelStyle}>Event / Occasion *</label>
              <input style={inputStyle} value={form.eventName} onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))} placeholder="e.g. Birthday Party"/>
            </div>
            <div>
              <label style={labelStyle}>Date *</label>
              <input style={inputStyle} type="date" value={form.date} min={new Date().toISOString().split("T")[0]} onChange={e => setForm(f => ({ ...f, date: e.target.value, slot: "fullday" }))}/>
            </div>
            <div>
              <label style={labelStyle}>Slot</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 5 }}>
                {availableSlots(form.date).map(opt => (
                  <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, fontFamily: body, color: C.textDark }}>
                    <input type="radio" name="admin-slot" value={opt.value} checked={form.slot === opt.value} onChange={() => setForm(f => ({ ...f, slot: opt.value }))} style={{ accentColor: C.maroon }}/>
                    {opt.label}
                  </label>
                ))}
                {availableSlots(form.date).length === 0 && (
                  <span style={{ fontSize: 12, color: C.red, fontFamily: body }}>Date fully booked</span>
                )}
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontFamily: body, color: C.textDark }}>
              <input type="checkbox" checked={form.isMember} onChange={e => setForm(f => ({ ...f, isMember: e.target.checked }))} style={{ accentColor: C.maroon }}/>
              Member booking (member rate applies)
            </label>
          </div>
          <button
            onClick={handleCreate}
            disabled={!form.date || !form.bookingName || !form.eventName || availableSlots(form.date).length === 0}
            style={{ padding: "10px 24px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: body, opacity: (!form.date || !form.bookingName || !form.eventName) ? 0.5 : 1 }}
          >
            Create Booking
          </button>
        </div>
      )}

      <div className="admin-hall-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Calendar */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button onClick={prevMonth} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 0, padding: "6px 14px", cursor: "pointer", fontFamily: body, fontSize: 13 }}>←</button>
            <span style={{ fontFamily: display, fontSize: 16, color: C.textDark }}>{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 0, padding: "6px 14px", cursor: "pointer", fontFamily: body, fontSize: 13 }}>→</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: C.textLight, fontFamily: body, padding: "4px 0" }}>{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={i}/>;
              const iso = toISO(year, month, day);
              const booking = bookingsByDate[iso];
              const status = booking?.status;
              const bg = status === "approved" ? C.greenLight : status === "pending" ? "rgba(216,167,55,0.15)" : status === "declined" ? "rgba(192,57,43,0.08)" : C.white;
              const color = status === "approved" ? C.green : status === "pending" ? "#b8911f" : status === "declined" ? C.red : C.textDark;
              return (
                <div key={i} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", background: bg, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: body, color }}>
                  {day}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 14, flexWrap: "wrap" }}>
            {[["Available", C.white], ["Pending", "rgba(216,167,55,0.15)"], ["Approved", C.greenLight], ["Declined", "rgba(192,57,43,0.08)"]].map(([label, bg]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 12, height: 12, background: bg, border: `1px solid ${C.border}` }}/>
                <span style={{ fontSize: 10, color: C.textLight, fontFamily: body }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="admin-hall-stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignContent: "start" }}>
          {[
            { label: "Total Enquiries", value: hallHireBookings.length, color: C.maroon },
            { label: "Pending", value: hallHireBookings.filter(b => b.status === "pending").length, color: "#b8911f" },
            { label: "Approved", value: hallHireBookings.filter(b => b.status === "approved").length, color: C.green },
            { label: "Declined", value: hallHireBookings.filter(b => b.status === "declined").length, color: C.red },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: C.white, border: `1px solid ${C.border}`, padding: "20px 18px", textAlign: "center" }}>
              <div style={{ fontFamily: display, fontSize: 28, color, marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 11, color: C.textLight, fontFamily: body }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Enquiry list */}
      <div style={{ fontFamily: display, fontSize: 16, color: C.textDark, marginBottom: 14, letterSpacing: 0.5 }}>All Enquiries</div>
      {hallHireBookings.length === 0 && <p style={{ color: C.textLight, fontSize: 13, fontFamily: body }}>No enquiries yet.</p>}
      {hallHireBookings.map(b => (
        <div key={b.id} style={{ background: C.white, border: `1px solid ${C.border}`, padding: "18px 22px", marginBottom: 12 }}>
          <div className="admin-booking-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: C.textDark, fontFamily: body }}>{b.name}</span>
                <span style={{ padding: "3px 12px", background: statusBg[b.status] || C.cream, color: statusColor[b.status] || C.textMid, fontSize: 11, fontWeight: 700, fontFamily: body, textTransform: "uppercase", letterSpacing: 0.5 }}>{b.status}</span>
              </div>
              <div className="admin-booking-details" style={{ display: "grid", gridTemplateColumns: "repeat(3, auto)", gap: "4px 24px", marginBottom: 8 }}>
                {[["📅 Date", b.dateDisplay || b.date], ["🎉 Event", b.eventType], ["👥 Guests", b.expectedGuests]].map(([k, v]) => (
                  <div key={k} style={{ fontSize: 12, fontFamily: body }}>
                    <span style={{ color: C.textLight }}>{k}: </span>
                    <span style={{ color: C.textDark, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
                {b.slot && HALL_SLOTS[b.slot] && (
                  <div style={{ fontSize: 12, fontFamily: body }}>
                    <span style={{ color: C.textLight }}>⏰ Time: </span>
                    <span style={{ color: C.textDark, fontWeight: 600 }}>{HALL_SLOTS[b.slot].label}</span>
                  </div>
                )}
                {b.appliedPrice != null && (
                  <div style={{ fontSize: 12, fontFamily: body }}>
                    <span style={{ color: C.textLight }}>💰 Price: </span>
                    <span style={{ color: C.textDark, fontWeight: 600 }}>${b.appliedPrice}</span>
                    {b.isMember && b.fullPrice !== b.appliedPrice && (
                      <span style={{ fontSize: 11, color: C.green, marginLeft: 6 }}>(member rate)</span>
                    )}
                  </div>
                )}
              </div>
              {[["✉️", b.email], ["📞", b.phone]].map(([icon, val]) => (
                <div key={val} style={{ fontSize: 12, color: C.textMid, fontFamily: body, marginBottom: 2 }}>{icon} {val}</div>
              ))}
              {b.notes && <p style={{ fontSize: 12, color: C.textMid, fontFamily: body, marginTop: 8, padding: "10px 12px", background: C.cream, lineHeight: 1.5 }}>{b.notes}</p>}
              <div style={{ fontSize: 11, color: C.textLight, fontFamily: body, marginTop: 8 }}>Submitted {b.submittedAt}</div>
            </div>
            <div className="admin-booking-card-actions" style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 20 }}>
              {b.status !== "approved" && (
                <button onClick={() => updateBookingStatus(b.id, "approved")} style={{ padding: "8px 16px", background: C.greenLight, border: `1px solid ${C.green}`, borderRadius: 0, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: body, color: C.green }}>
                  ✓ Approve
                </button>
              )}
              {b.status !== "pending" && (
                <button onClick={() => updateBookingStatus(b.id, "pending")} style={{ padding: "8px 16px", background: "rgba(216,167,55,0.1)", border: `1px solid ${C.gold}`, borderRadius: 0, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: body, color: "#b8911f" }}>
                  ⏳ Pending
                </button>
              )}
              {b.status !== "declined" && (
                <button onClick={() => updateBookingStatus(b.id, "declined")} style={{ padding: "8px 16px", background: "rgba(192,57,43,0.06)", border: `1px solid ${C.red}`, borderRadius: 0, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: body, color: C.red }}>
                  ✕ Decline
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Super Admin Tab ──────────────────────────────────────────────────────────

function SuperAdminTab({ members, updateMemberPosition }) {
  const { t } = useLang();
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");

  const currentAdmins = members.filter(m => !!m.adminPosition);
  const eligibleMembers = members.filter(m => !m.adminPosition);

  const handleAdd = () => {
    if (!selectedMemberId || !selectedPosition) return;
    updateMemberPosition(selectedMemberId, { adminPosition: selectedPosition, isSuperAdmin: false });
    setSelectedMemberId("");
    setSelectedPosition("");
  };

  const handleDemote = (member) => {
    const msg = t("superAdmin.demoteConfirm")
      .replace("{name}", member.fullName)
      .replace("{position}", member.adminPosition);
    if (window.confirm(msg)) {
      updateMemberPosition(member.id, { adminPosition: null, isSuperAdmin: false });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: display, fontSize: 20, color: C.textDark, margin: "0 0 4px", letterSpacing: 0.5 }}>{t("superAdmin.pageTitle")}</h2>
        <p style={{ fontSize: 13, color: C.textMid, fontFamily: body, margin: 0 }}>{t("superAdmin.pageDescription")}</p>
      </div>

      <div style={{ fontFamily: display, fontSize: 15, color: C.textDark, marginBottom: 12, letterSpacing: 0.5 }}>{t("superAdmin.currentAdminsHeading")}</div>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, marginBottom: 28, overflow: "auto" }}>
        {currentAdmins.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: C.textLight, fontFamily: body }}>{t("superAdmin.noAdmins")}</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: body }}>
            <thead>
              <tr style={{ background: C.cream, borderBottom: `1px solid ${C.border}` }}>
                {["Name", t("superAdmin.positionLabel"), ""].map((h, i) => (
                  <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: C.textMid, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentAdmins.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : C.cream }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 600, color: C.textDark }}>{m.fullName}</div>
                    {m.isSuperAdmin && (
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: C.maroon, fontFamily: body }}>
                        {t("superAdmin.superAdminBadge")}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <select
                      style={{ ...inputStyle, width: "auto" }}
                      value={m.adminPosition}
                      onChange={e => updateMemberPosition(m.id, { adminPosition: e.target.value, isSuperAdmin: m.isSuperAdmin })}
                    >
                      {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right" }}>
                    {!m.isSuperAdmin && (
                      <button
                        onClick={() => handleDemote(m)}
                        style={{ padding: "7px 14px", background: "rgba(192,57,43,0.06)", border: `1px solid ${C.red}`, borderRadius: 0, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: body, color: C.red }}
                      >
                        {t("superAdmin.demote")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ fontFamily: display, fontSize: 15, color: C.textDark, marginBottom: 12, letterSpacing: 0.5 }}>{t("superAdmin.addAdminHeading")}</div>
      {eligibleMembers.length === 0 ? (
        <div style={{ fontSize: 13, color: C.textLight, fontFamily: body }}>{t("superAdmin.noEligibleMembers")}</div>
      ) : (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: "20px 24px", display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={labelStyle}>{t("superAdmin.selectMember")}</label>
            <select style={inputStyle} value={selectedMemberId} onChange={e => setSelectedMemberId(e.target.value)}>
              <option value="">{t("superAdmin.selectMember")}</option>
              {eligibleMembers.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
            </select>
          </div>
          <div style={{ flex: 2, minWidth: 180 }}>
            <label style={labelStyle}>{t("superAdmin.positionLabel")}</label>
            <select style={inputStyle} value={selectedPosition} onChange={e => setSelectedPosition(e.target.value)}>
              <option value="">{t("superAdmin.selectPosition")}</option>
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={!selectedMemberId || !selectedPosition}
            style={{ padding: "10px 24px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: body, opacity: (!selectedMemberId || !selectedPosition) ? 0.5 : 1, flexShrink: 0 }}
          >
            {t("superAdmin.add")}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { members, addMember, updateMember, events, addEvent, updateEvent, deleteEvent, notices, addNotice, updateNotice, deleteNotice, togglePinNotice, hallHireBookings, addHallHireBooking, updateBookingStatus, blockedDates, blockedSlots, setRole, addNotification, currentAdmin, updateMemberPosition } = useDemo();
  const [tab, setTab] = useState("Analytics");
  const { lang, setLang, t } = useLang();
  const [toast, setToast] = useState(null);
  const showToast = (message) => setToast({ message });

  const tabs = ["Analytics", "Members", "Events", "Notice Board", "Hall Hire"];
  if (currentAdmin?.isSuperAdmin) tabs.push("Super Admin");

  useEffect(() => {
    if (tab === "Super Admin" && !currentAdmin?.isSuperAdmin) {
      setTab("Analytics");
    }
  }, [currentAdmin?.isSuperAdmin, tab]);

  const handleSignOut = () => { setRole("public"); navigate("/"); };

  return (
    <div style={{ fontFamily: body, background: C.cream, minHeight: "100vh", paddingTop: 36 }}>
      {/* Top nav */}
      <div style={{ background: C.maroon, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52, borderBottom: `2px solid ${C.goldBright}`, position: "sticky", top: 36, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: C.goldBright }}><SunIcon s={20}/></span>
          <span className="nav-brand-name topbar-title" style={{ color: C.white, fontWeight: 700, fontSize: 14, fontFamily: display, letterSpacing: 1 }}>Macedonian Community of Brisbane</span>
          <span className="admin-top-nav-title" style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginLeft: 8, padding: "3px 10px", background: "rgba(255,255,255,0.08)", fontWeight: 600, fontFamily: body }}>Committee Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button onClick={() => setLang("en")} style={{ background: "none", border: "none", borderRadius: 0, cursor: "pointer", fontFamily: body, fontSize: 12, fontWeight: lang === "en" ? 700 : 500, color: lang === "en" ? C.goldBright : "rgba(255,255,255,0.4)", padding: "4px 8px" }}>EN</button>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, userSelect: "none" }}>·</span>
            <button onClick={() => setLang("mk")} style={{ background: "none", border: "none", borderRadius: 0, cursor: "pointer", fontFamily: body, fontSize: 12, fontWeight: lang === "mk" ? 700 : 500, color: lang === "mk" ? C.goldBright : "rgba(255,255,255,0.4)", padding: "4px 8px" }}>MK</button>
          </div>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: body, fontWeight: 500 }}>Home</button>
          <button onClick={handleSignOut} title="Sign out" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", padding: 4 }}>
            <LogOutIcon/>
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="admin-tab-bar" style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", gap: 0, position: "sticky", top: 88, zIndex: 90 }}>
        {tabs.map(tabKey => (
          <button key={tabKey} onClick={() => setTab(tabKey)} style={{
            padding: "14px 20px", border: "none", background: "none", cursor: "pointer", fontFamily: body,
            fontSize: 13, fontWeight: tab === tabKey ? 700 : 500, color: tab === tabKey ? C.maroon : C.textMid,
            borderBottom: tab === tabKey ? `2px solid ${C.maroon}` : "2px solid transparent",
            marginBottom: -1,
          }}>
            {tabKey === "Super Admin" ? t("superAdmin.tabLabel") : tabKey}
          </button>
        ))}
      </div>

      <div className="admin-content" style={{ maxWidth: 1200, margin: "0 auto", padding: 28 }}>
        {tab === "Analytics" && <AnalyticsTab members={members}/>}
        {tab === "Members" && <MembersTab members={members} addMember={addMember} updateMember={updateMember}/>}
        {tab === "Events" && <EventsTab events={events} addEvent={addEvent} updateEvent={updateEvent} deleteEvent={deleteEvent} showToast={showToast}/>}
        {tab === "Notice Board" && <NoticeBoardTab notices={notices} addNotice={addNotice} updateNotice={updateNotice} deleteNotice={deleteNotice} togglePinNotice={togglePinNotice} showToast={showToast}/>}
        {tab === "Hall Hire" && <HallHireTab hallHireBookings={hallHireBookings} updateBookingStatus={updateBookingStatus} blockedDates={blockedDates} blockedSlots={blockedSlots} addHallHireBooking={addHallHireBooking}/>}
        {tab === "Super Admin" && <SuperAdminTab members={members} updateMemberPosition={updateMemberPosition}/>}
      </div>

      <Toast message={toast?.message} visible={!!toast} onDismiss={() => setToast(null)}/>
    </div>
  );
}
