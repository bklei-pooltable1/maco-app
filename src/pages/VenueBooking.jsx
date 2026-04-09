import { useState, useEffect } from "react";
import Badge from "../components/ui/Badge";
import { CheckIcon, XIcon, EditIcon } from "../components/ui/Icons";
import { C, body, display } from "../theme";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const inputStyle = {
  width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`,
  borderRadius: 0, fontSize: 13, fontFamily: body, color: C.textDark,
  background: C.white, outline: "none", marginTop: 4,
};

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: C.textMid,
  textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body,
};

const PRICING = {
  full_day_member: 440,
  full_day_public: 550,
  half_day_member: 240,
  half_day_public: 300,
};

// Slot presets — selecting a slot pre-fills start/end times
const BOOKING_SLOTS = [
  { value: "morning",   label: "Morning Slot (9am – 1pm)",   start: "09:00", end: "13:00" },
  { value: "afternoon", label: "Afternoon Slot (1pm – 5pm)", start: "13:00", end: "17:00" },
  { value: "fullday",   label: "Full Day (9am – 5pm)",        start: "09:00", end: "17:00" },
  { value: "custom",    label: "Custom Times",                start: "",      end: "" },
];

export default function VenueBooking() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [subscription, setSubscription] = useState(null);

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

  const [form, setForm] = useState({
    family_name: "", date: "", slot: "fullday", start_time: "09:00", end_time: "17:00", purpose: "", notes: "",
  });

  const fetchData = async () => {
    const bookingsQuery = isAdmin
      ? supabase.from("venue_bookings").select("*, profiles(full_name, email)").order("date")
      : supabase.from("venue_bookings").select("*").eq("user_id", profile?.id).order("date");

    const [bookingsRes, subRes] = await Promise.all([
      bookingsQuery,
      supabase.from("subscriptions").select("status").eq("user_id", profile?.id).single(),
    ]);

    if (!bookingsRes.error) setBookings(bookingsRes.data || []);
    if (!subRes.error) setSubscription(subRes.data);
    setLoading(false);
  };

  useEffect(() => { if (profile) fetchData(); }, [profile]);

  const isMember = subscription?.status === "active";

  const estimateAmount = () => {
    if (!form.start_time || !form.end_time) return null;
    const start = parseInt(form.start_time.split(":")[0]);
    const end = parseInt(form.end_time.split(":")[0]);
    const hours = end - start;
    if (hours >= 8) return isMember ? PRICING.full_day_member : PRICING.full_day_public;
    return isMember ? PRICING.half_day_member : PRICING.half_day_public;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const amount = estimateAmount();
    const { error } = await supabase.from("venue_bookings").insert({
      user_id: profile.id,
      family_name: form.family_name || profile.full_name,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      purpose: form.purpose,
      notes: form.notes,
      status: "pending",
      amount,
      is_member: isMember,
    });
    setSaving(false);
    if (error) {
      setError("Failed to submit booking. Please try again.");
    } else {
      setSuccess("Booking request submitted! The committee will confirm shortly.");
      setShowForm(false);
      setForm({ family_name: "", date: "", start_time: "", end_time: "", purpose: "", notes: "" });
      fetchData();
    }
  };

  const updateStatus = async (id, status) => {
    await supabase.from("venue_bookings").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    fetchData();
  };

  const statusColor = (s) => s === "confirmed" ? "green" : s === "rejected" ? "red" : "gold";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textDark, margin: "0 0 4px", fontFamily: display, letterSpacing: 1 }}>
            {isAdmin ? "Venue Booking Management" : "Book the Community Hall"}
          </h2>
          <p style={{ fontSize: 13, color: C.textLight, margin: 0, fontFamily: body }}>
            {isAdmin ? "Approve, reject or reschedule booking requests" : "Members receive 20% discount on all bookings"}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "9px 18px", background: C.maroon, color: C.white,
              border: "none", borderRadius: 0, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: body,
            }}
          >
            {showForm ? "Cancel" : "Request a Booking"}
          </button>
        )}
      </div>

      {/* Pricing info */}
      {!isAdmin && (
        <div className="analytics-stat-cards" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Full Day (Member)", price: `$${PRICING.full_day_member}` },
            { label: "Half Day (Member)", price: `$${PRICING.half_day_member}` },
            { label: "Full Day (Public)", price: `$${PRICING.full_day_public}` },
            { label: "Half Day (Public)", price: `$${PRICING.half_day_public}` },
          ].map(({ label, price }) => (
            <div key={label} style={{ padding: "14px 16px", background: C.white, border: `1px solid ${C.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.textLight, fontFamily: body, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.maroon, fontFamily: display }}>{price}</div>
            </div>
          ))}
        </div>
      )}

      {isMember && !isAdmin && (
        <div style={{ background: C.greenLight, border: `1px solid ${C.green}`, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: C.green, fontFamily: body, fontWeight: 600 }}>
          ✓ Your member discount is applied automatically
        </div>
      )}

      {error && <div style={{ background: "rgba(192,57,43,0.08)", border: `1px solid ${C.red}`, color: C.red, padding: "10px 14px", fontSize: 13, fontFamily: body, marginBottom: 16 }}>{error}</div>}
      {success && <div style={{ background: C.greenLight, border: `1px solid ${C.green}`, color: C.green, padding: "10px 14px", fontSize: 13, fontFamily: body, marginBottom: 16 }}>{success}</div>}

      {/* Booking form */}
      {showForm && !isAdmin && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textDark, margin: "0 0 16px", fontFamily: display, letterSpacing: 1 }}>Booking Request</h3>
          <form onSubmit={handleSubmit}>
            <div className="modal-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Family Name</label>
                <input type="text" style={inputStyle} value={form.family_name} onChange={(e) => setForm({ ...form, family_name: e.target.value })} placeholder={profile?.full_name}/>
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input type="date" required style={inputStyle} value={form.date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setForm({ ...form, date: e.target.value })}/>
              </div>
            </div>

            {/* Slot selector */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Booking Slot</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                {BOOKING_SLOTS.map(opt => (
                  <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "8px 12px", border: `1px solid ${form.slot === opt.value ? C.maroon : C.border}`, background: form.slot === opt.value ? "rgba(140,26,17,0.06)" : C.white, fontSize: 12, fontFamily: body, color: C.textDark }}>
                    <input type="radio" name="booking-slot" value={opt.value} checked={form.slot === opt.value}
                      onChange={() => setForm(f => ({ ...f, slot: opt.value, start_time: opt.start || f.start_time, end_time: opt.end || f.end_time }))}
                      style={{ accentColor: C.maroon }}/>
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Custom times — only shown for "custom" slot */}
            {form.slot === "custom" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Start Time</label>
                  <input type="time" required style={inputStyle} value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}/>
                </div>
                <div>
                  <label style={labelStyle}>End Time</label>
                  <input type="time" required style={inputStyle} value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })}/>
                </div>
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Purpose / Occasion</label>
              <input type="text" required style={inputStyle} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="e.g. Birthday party, Family gathering"/>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Additional Notes</label>
              <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special requirements…"/>
            </div>
            {estimateAmount() && (
              <div style={{ background: C.goldMuted, border: `1px solid ${C.goldLight}`, padding: "10px 14px", marginBottom: 16, fontSize: 13, fontFamily: body, color: C.textDark }}>
                Estimated amount: <strong>${estimateAmount()}</strong> {isMember ? "(member rate)" : "(public rate)"}
              </div>
            )}
            <button type="submit" disabled={saving} style={{ padding: "12px 28px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", fontFamily: body, opacity: saving ? 0.7 : 1 }}>
              {saving ? "Submitting…" : "Submit Booking Request"}
            </button>
          </form>
        </div>
      )}

      {/* Bookings list */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textDark, margin: "0 0 12px", fontFamily: display, letterSpacing: 1 }}>
        {isAdmin ? "All Bookings" : "My Bookings"}
      </h3>
      {loading ? (
        <p style={{ color: C.textLight, fontFamily: body }}>Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <p style={{ color: C.textLight, fontFamily: body }}>No bookings yet.</p>
      ) : (
        <div className="table-scroll-container" style={{ background: C.white, borderRadius: 0, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "1.2fr 1fr 1fr 0.8fr 0.8fr 1fr" : "1fr 1fr 1fr 0.8fr", padding: "10px 16px", background: C.maroon, gap: 8 }}>
            {(isAdmin ? ["Requested By", "Date", "Time", "Amount", "Status", "Actions"] : ["Date", "Time", "Purpose", "Status"]).map((h) => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.white, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body }}>{h}</span>
            ))}
          </div>
          {bookings.map((b, i) => (
            <div key={b.id} style={{
              display: "grid",
              gridTemplateColumns: isAdmin ? "1.2fr 1fr 1fr 0.8fr 0.8fr 1fr" : "1fr 1fr 1fr 0.8fr",
              padding: "12px 16px", borderBottom: `1px solid ${C.border}`,
              background: i % 2 === 0 ? C.white : C.cream, gap: 8, alignItems: "center",
            }}>
              {isAdmin && (
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.textDark, fontFamily: body }}>{b.family_name}</span>
                  {b.profiles?.email && <div style={{ fontSize: 11, color: C.textLight, fontFamily: body }}>{b.profiles.email}</div>}
                </div>
              )}
              <span style={{ fontSize: 13, color: C.textMid, fontFamily: body }}>{new Date(b.date + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</span>
              <span style={{ fontSize: 12, color: C.textMid, fontFamily: body }}>{b.start_time} – {b.end_time}</span>
              {isAdmin ? (
                <span style={{ fontSize: 13, fontWeight: 700, color: C.maroon, fontFamily: body }}>{b.amount ? `$${b.amount}` : "—"}</span>
              ) : (
                <span style={{ fontSize: 12, color: C.textMid, fontFamily: body }}>{b.purpose}</span>
              )}
              <Badge color={statusColor(b.status)}>{b.status}</Badge>
              {isAdmin && (
                <div style={{ display: "flex", gap: 6 }}>
                  {b.status !== "confirmed" && (
                    <button
                      onClick={() => updateStatus(b.id, "confirmed")}
                      title="Confirm"
                      style={{ padding: "5px 8px", background: C.greenLight, color: C.green, border: `1px solid ${C.green}`, borderRadius: 0, cursor: "pointer", fontFamily: body, fontSize: 11, fontWeight: 600 }}
                    >
                      Confirm
                    </button>
                  )}
                  {b.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus(b.id, "rejected")}
                      title="Reject"
                      style={{ padding: "5px 8px", background: "rgba(192,57,43,0.08)", color: C.red, border: `1px solid ${C.red}`, borderRadius: 0, cursor: "pointer", fontFamily: body, fontSize: 11, fontWeight: 600 }}
                    >
                      Reject
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
