import { useState, useEffect } from "react";
import Badge from "../components/ui/Badge";
import { PlusIcon, EditIcon, TrashIcon, LockIcon } from "../components/ui/Icons";
import { C, body, display } from "../theme";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const inputStyle = {
  width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`,
  borderRadius: 0, fontSize: 13, fontFamily: body, color: C.textDark,
  background: C.white, outline: "none", marginTop: 4,
};

const emptyForm = { title: "", description: "", date: "", time: "", end_time: "", type: "Service", members_only: false };

export default function Events() {
  const { profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";
  const hasSubscription = true; // TODO: derive from actual subscription status

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date")
      .order("time");
    if (!error) setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const openNew = () => {
    setEditingEvent(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setForm({
      title: event.title, description: event.description || "",
      date: event.date, time: event.time || "", end_time: event.end_time || "",
      type: event.type, members_only: event.members_only,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editingEvent) {
      await supabase.from("events").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editingEvent.id);
    } else {
      await supabase.from("events").insert({ ...form, created_by: profile.id });
    }
    setSaving(false);
    setShowForm(false);
    fetchEvents();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    fetchEvents();
  };

  const grouped = events.reduce((acc, e) => {
    const month = new Date(e.date).toLocaleDateString("en-AU", { month: "long", year: "numeric" });
    if (!acc[month]) acc[month] = [];
    acc[month].push(e);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textDark, margin: "0 0 4px", fontFamily: display, letterSpacing: 1 }}>Events Calendar</h2>
          <p style={{ fontSize: 13, color: C.textLight, margin: 0, fontFamily: body }}>Community services, celebrations & member events</p>
        </div>
        {isAdmin && (
          <button
            onClick={openNew}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 18px",
              background: C.maroon, color: C.white, border: "none", borderRadius: 0,
              fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: body,
            }}
          >
            <PlusIcon/> Add Event
          </button>
        )}
      </div>

      {/* Event form */}
      {showForm && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textDark, margin: "0 0 16px", fontFamily: display, letterSpacing: 1 }}>
            {editingEvent ? "Edit Event" : "New Event"}
          </h3>
          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body }}>Title</label>
                <input type="text" required style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title"/>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body }}>Type</label>
                <select style={inputStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {["Service", "Cultural", "Social", "Youth", "Committee", "Holiday"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body }}>Date</label>
                <input type="date" required style={inputStyle} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}/>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body }}>Start Time</label>
                  <input type="time" style={inputStyle} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}/>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body }}>End Time</label>
                  <input type="time" style={inputStyle} value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })}/>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body }}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description…"/>
            </div>
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" id="members_only" checked={form.members_only} onChange={(e) => setForm({ ...form, members_only: e.target.checked })} style={{ accentColor: C.maroon }}/>
              <label htmlFor="members_only" style={{ fontSize: 13, color: C.textMid, fontFamily: body, cursor: "pointer" }}>Members only event</label>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={saving} style={{ padding: "10px 22px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: body, opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : "Save Event"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px 22px", background: "transparent", color: C.textMid, border: `1px solid ${C.border}`, borderRadius: 0, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: body }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: C.textLight, fontFamily: body }}>Loading events…</p>
      ) : Object.entries(grouped).length === 0 ? (
        <p style={{ color: C.textLight, fontFamily: body }}>No events yet.</p>
      ) : (
        Object.entries(grouped).map(([month, monthEvents]) => (
          <div key={month} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.maroon, textTransform: "uppercase", letterSpacing: 2, fontFamily: body, marginBottom: 12 }}>
              {month}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {monthEvents.map((event) => {
                const dateObj = new Date(event.date + "T00:00:00");
                const day = dateObj.toLocaleDateString("en-AU", { weekday: "short" });
                const dateNum = dateObj.getDate();
                const month3 = dateObj.toLocaleDateString("en-AU", { month: "short" });
                const locked = event.members_only;
                const canSee = !locked || profile;

                return (
                  <div key={event.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", background: C.white, borderRadius: 0,
                    border: `1px solid ${C.border}`,
                    opacity: locked && !canSee ? 0.6 : 1,
                  }}>
                    <div style={{ minWidth: 48, textAlign: "center", padding: "8px 4px", background: C.cream, borderRadius: 0, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.maroon, textTransform: "uppercase", fontFamily: body }}>{month3}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: C.maroonDark, fontFamily: display }}>{dateNum}</div>
                      <div style={{ fontSize: 9, color: C.textLight, fontFamily: body }}>{day}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, display: "flex", alignItems: "center", gap: 6, fontFamily: body }}>
                        {event.title} {locked && <LockIcon/>}
                      </div>
                      {event.time && <div style={{ fontSize: 12, color: C.textLight, marginTop: 2, fontFamily: body }}>{event.time}{event.end_time ? ` – ${event.end_time}` : ""}</div>}
                      {event.description && <div style={{ fontSize: 12, color: C.textMid, marginTop: 4, fontFamily: body }}>{event.description}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Badge>{event.type}</Badge>
                      {isAdmin && (
                        <>
                          <button onClick={() => openEdit(event)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textLight, padding: 4 }}><EditIcon/></button>
                          <button onClick={() => handleDelete(event.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.red, padding: 4 }}><TrashIcon/></button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
