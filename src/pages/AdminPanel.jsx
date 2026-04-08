import { useState, useEffect } from "react";
import Badge from "../components/ui/Badge";
import { C, body, display } from "../theme";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function StatCard({ label, value, sub }) {
  return (
    <div style={{ flex: 1, padding: "20px", background: C.white, borderRadius: 0, border: `1px solid ${C.border}`, minWidth: 120 }}>
      <div style={{ fontSize: 11, color: C.textLight, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: body }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: C.maroon, marginTop: 4, fontFamily: display }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.green, marginTop: 2, fontFamily: body }}>{sub}</div>}
    </div>
  );
}

const TABS = ["Dashboard", "Members", "Bookings"];

export default function AdminPanel() {
  const { profile } = useAuth();
  const [tab, setTab] = useState("Dashboard");
  const [members, setMembers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, revenue: 0, bookingCount: 0 });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

  useEffect(() => {
    if (!isAdmin) return;
    async function load() {
      const [profilesRes, subsRes, bookingsRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("*"),
        supabase.from("venue_bookings").select("*, profiles(full_name, email)").order("created_at", { ascending: false }),
      ]);

      const allMembers = profilesRes.data || [];
      const allSubs = subsRes.data || [];
      const allBookings = bookingsRes.data || [];

      const activeSubs = allSubs.filter((s) => s.status === "active");
      const revenue = activeSubs.length * 120;

      setMembers(allMembers.map((m) => ({
        ...m,
        subscription: allSubs.find((s) => s.user_id === m.id),
      })));
      setBookings(allBookings);
      setStats({
        total: allMembers.filter((m) => m.role !== "super_admin").length,
        active: activeSubs.length,
        revenue,
        bookingCount: allBookings.filter((b) => b.status === "pending").length,
      });

      // Build activity feed from recent records
      const recentActivity = [
        ...allBookings.slice(0, 3).map((b) => ({
          action: `Hall booking ${b.status}`,
          detail: `${b.family_name} — ${b.date}`,
          time: b.created_at,
        })),
        ...allMembers.slice(0, 2).map((m) => ({
          action: "New member registered",
          detail: m.full_name,
          time: m.created_at,
        })),
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

      setActivity(recentActivity);
      setLoading(false);
    }
    load();
  }, [isAdmin]);

  const updateBookingStatus = async (id, status) => {
    await supabase.from("venue_bookings").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
  };

  const subStatusForMember = (m) => {
    if (!m.subscription) return "None";
    return m.subscription.status === "active" ? "Active" : m.subscription.status === "cancelled" ? "Cancelled" : "Expired";
  };

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (!isAdmin) return (
    <div style={{ padding: 40, textAlign: "center", color: C.textLight, fontFamily: body }}>Access denied.</div>
  );

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textDark, margin: "0 0 20px", fontFamily: display, letterSpacing: 1 }}>Committee Dashboard</h2>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: `1px solid ${C.border}` }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 20px", border: "none", background: "transparent", borderRadius: 0,
              borderBottom: tab === t ? `2px solid ${C.maroon}` : "2px solid transparent",
              color: tab === t ? C.maroon : C.textMid,
              fontWeight: tab === t ? 700 : 500, fontSize: 13, cursor: "pointer", fontFamily: body,
              marginBottom: -1,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: C.textLight, fontFamily: body }}>Loading…</p>
      ) : tab === "Dashboard" ? (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <StatCard label="Total Members" value={stats.total} sub={`${stats.active} active`}/>
            <StatCard label="Active Subs" value={stats.active}/>
            <StatCard label="Annual Revenue" value={`$${stats.revenue.toLocaleString()}`}/>
            <StatCard label="Pending Bookings" value={stats.bookingCount}/>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: C.textDark, margin: "0 0 12px", fontFamily: display, letterSpacing: 1 }}>Recent Activity</h3>
          <div style={{ background: C.white, borderRadius: 0, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {activity.length === 0 ? (
              <div style={{ padding: "20px 16px", fontSize: 13, color: C.textLight, fontFamily: body }}>No recent activity.</div>
            ) : activity.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: i < activity.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, fontFamily: body }}>{item.action}</div>
                  <div style={{ fontSize: 12, color: C.textLight, fontFamily: body }}>{item.detail}</div>
                </div>
                <span style={{ fontSize: 11, color: C.textLight, whiteSpace: "nowrap", fontFamily: body }}>{timeAgo(item.time)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : tab === "Members" ? (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: C.textLight, margin: 0, fontFamily: body }}>{members.length} registered members</p>
            <button
              onClick={() => {
                const csv = ["Name,Email,Role,Subscription,Joined", ...members.map((m) => `"${m.full_name}","${m.email}","${m.role}","${subStatusForMember(m)}","${new Date(m.created_at).toLocaleDateString()}"`)].join("\n");
                const a = document.createElement("a");
                a.href = "data:text/csv," + encodeURIComponent(csv);
                a.download = "members.csv";
                a.click();
              }}
              style={{ padding: "8px 16px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: body }}
            >
              Export CSV
            </button>
          </div>
          <div style={{ background: C.white, borderRadius: 0, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr 0.8fr 0.8fr 0.7fr", padding: "10px 16px", background: C.maroon, gap: 8 }}>
              {["Name", "Email", "Role", "Subscription", "Joined"].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.white, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body }}>{h}</span>
              ))}
            </div>
            {members.map((m, i) => {
              const subStatus = subStatusForMember(m);
              return (
                <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr 0.8fr 0.8fr 0.7fr", padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : C.cream, gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.textDark, fontFamily: body }}>{m.full_name}</span>
                  <span style={{ fontSize: 12, color: C.textLight, fontFamily: body }}>{m.email}</span>
                  <Badge color={m.role === "super_admin" ? "maroon" : m.role === "admin" ? "gold" : "gold"}>
                    {m.role === "super_admin" ? "Super Admin" : m.role === "admin" ? "Admin" : "Member"}
                  </Badge>
                  <Badge color={subStatus === "Active" ? "green" : subStatus === "Cancelled" ? "red" : "gold"}>{subStatus}</Badge>
                  <span style={{ fontSize: 12, color: C.textLight, fontFamily: body }}>{new Date(m.created_at).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : tab === "Bookings" ? (
        <div>
          <p style={{ fontSize: 13, color: C.textLight, margin: "0 0 16px", fontFamily: body }}>Manage venue hire requests</p>
          <div style={{ background: C.white, borderRadius: 0, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 0.7fr 0.8fr 1.2fr", padding: "10px 16px", background: C.maroon, gap: 8 }}>
              {["Requested By", "Date", "Time", "Amount", "Status", "Actions"].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.white, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body }}>{h}</span>
              ))}
            </div>
            {bookings.length === 0 ? (
              <div style={{ padding: "20px 16px", fontSize: 13, color: C.textLight, fontFamily: body }}>No bookings yet.</div>
            ) : bookings.map((b, i) => (
              <div key={b.id} style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 0.7fr 0.8fr 1.2fr", padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : C.cream, gap: 8, alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.textDark, fontFamily: body }}>{b.family_name}</span>
                  {b.profiles?.email && <div style={{ fontSize: 11, color: C.textLight, fontFamily: body }}>{b.profiles.email}</div>}
                </div>
                <span style={{ fontSize: 13, color: C.textMid, fontFamily: body }}>{new Date(b.date + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>
                <span style={{ fontSize: 12, color: C.textMid, fontFamily: body }}>{b.start_time} – {b.end_time}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.maroon, fontFamily: body }}>{b.amount ? `$${b.amount}` : "—"}</span>
                <Badge color={b.status === "confirmed" ? "green" : b.status === "rejected" ? "red" : "gold"}>{b.status}</Badge>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {b.status !== "confirmed" && (
                    <button onClick={() => updateBookingStatus(b.id, "confirmed")} style={{ padding: "5px 10px", background: C.greenLight, color: C.green, border: `1px solid ${C.green}`, borderRadius: 0, cursor: "pointer", fontFamily: body, fontSize: 11, fontWeight: 600 }}>Confirm</button>
                  )}
                  {b.status !== "rejected" && (
                    <button onClick={() => updateBookingStatus(b.id, "rejected")} style={{ padding: "5px 10px", background: "rgba(192,57,43,0.08)", color: C.red, border: `1px solid ${C.red}`, borderRadius: 0, cursor: "pointer", fontFamily: body, fontSize: 11, fontWeight: 600 }}>Reject</button>
                  )}
                  {b.status !== "pending" && (
                    <button onClick={() => updateBookingStatus(b.id, "pending")} style={{ padding: "5px 10px", background: C.goldMuted, color: C.gold, border: `1px solid ${C.gold}`, borderRadius: 0, cursor: "pointer", fontFamily: body, fontSize: 11, fontWeight: 600 }}>Reset</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
