import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/ui/Badge";
import { LockIcon, CalIcon, BuildingIcon, BellIcon } from "../components/ui/Icons";
import { C, body, display } from "../theme";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function EventCard({ event }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: C.white, borderRadius: 0, border: `1px solid ${C.border}` }}>
      <div style={{ minWidth: 48, textAlign: "center", padding: "8px 4px", background: C.cream, borderRadius: 0, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.maroon, textTransform: "uppercase", fontFamily: body }}>{event.date_display?.split(" ")[0]}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.maroonDark, fontFamily: display }}>{event.date_display?.split(" ")[1]}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, display: "flex", alignItems: "center", gap: 6, fontFamily: body }}>
          {event.title} {event.members_only && <LockIcon/>}
        </div>
        <div style={{ fontSize: 12, color: C.textLight, marginTop: 2, fontFamily: body }}>{event.time}</div>
      </div>
      <Badge>{event.type}</Badge>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ flex: 1, padding: "20px", background: C.white, borderRadius: 0, border: `1px solid ${C.border}`, minWidth: 120 }}>
      <div style={{ fontSize: 11, color: C.textLight, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: body }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: C.maroon, marginTop: 4, fontFamily: display }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.green, marginTop: 2, fontFamily: body }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

  useEffect(() => {
    async function loadData() {
      const [eventsRes, noticesRes, subRes] = await Promise.all([
        supabase.from("events").select("*").gte("date", new Date().toISOString().split("T")[0]).order("date").limit(3),
        supabase.from("noticeboard_posts").select("*").order("created_at", { ascending: false }).limit(2),
        supabase.from("subscriptions").select("*").eq("user_id", profile?.id).single(),
      ]);
      if (!eventsRes.error) {
        setUpcomingEvents(eventsRes.data.map((e) => ({
          ...e,
          date_display: new Date(e.date).toLocaleDateString("en-AU", { month: "short", day: "numeric" }),
        })));
      }
      if (!noticesRes.error) setNotices(noticesRes.data);
      if (!subRes.error) setSubscription(subRes.data);
      setLoading(false);
    }
    if (profile) loadData();
  }, [profile]);

  const handleSubscribe = async () => {
    const { data, error } = await supabase.functions.invoke("create-checkout-session", {
      body: { user_id: profile.id, email: profile.email, plan: "family_yearly" },
    });
    if (error || !data?.url) {
      alert("Could not start checkout. Please try again.");
      return;
    }
    window.location.href = data.url;
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center", color: C.textLight, fontFamily: body }}>Loading…</div>
  );

  const subActive = subscription?.status === "active";

  return (
    <div>
      {/* Welcome banner */}
      <div style={{ background: C.white, borderRadius: 0, border: `1px solid ${C.border}`, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: C.textLight, fontFamily: body }}>Welcome back,</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.textDark, fontFamily: display, letterSpacing: 1 }}>
          {profile?.full_name || "Member"}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <Badge color={subActive ? "green" : "red"}>{subActive ? "Active Member" : "No Active Subscription"}</Badge>
          {profile?.family_members && <Badge>{profile.family_members}</Badge>}
          {isAdmin && <Badge color="maroon">{profile.role === "super_admin" ? "Super Admin" : "Admin"}</Badge>}
        </div>
      </div>

      {/* Subscription prompt */}
      {!subActive && (
        <div style={{ background: C.goldMuted, border: `1px solid ${C.goldLight}`, padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark, fontFamily: body }}>Subscribe to unlock all member benefits</div>
            <div style={{ fontSize: 12, color: C.textMid, fontFamily: body, marginTop: 2 }}>$120/year — covers your entire family</div>
          </div>
          <button
            onClick={handleSubscribe}
            style={{ padding: "10px 22px", background: C.goldBright, color: C.maroonDeep, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: body }}
          >
            Subscribe Now →
          </button>
        </div>
      )}

      {/* Admin stats */}
      {isAdmin && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textDark, margin: "0 0 12px", fontFamily: display, letterSpacing: 1 }}>At a Glance</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatCard label="Quick Links" value="Admin" sub="Go to Admin Panel"/>
          </div>
          <button
            onClick={() => navigate("/admin")}
            style={{ marginTop: 10, padding: "10px 20px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: body }}
          >
            Open Admin Panel →
          </button>
        </div>
      )}

      {/* Upcoming Events */}
      <h3 style={{ fontSize: 20, fontWeight: 700, color: C.textDark, margin: "0 0 12px", fontFamily: display, letterSpacing: 1 }}>Upcoming Events</h3>
      {upcomingEvents.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {upcomingEvents.map((e) => <EventCard key={e.id} event={e}/>)}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: C.textLight, fontFamily: body, marginBottom: 24 }}>No upcoming events found.</p>
      )}

      {/* Shortcuts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { icon: <BellIcon/>, label: "Notice Board", path: "/noticeboard" },
          { icon: <CalIcon/>, label: "View Events", path: "/events" },
          { icon: <BuildingIcon/>, label: "Book the Hall", path: "/venue-booking" },
        ].map(({ icon, label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              padding: "18px 12px", background: C.white, border: `1px solid ${C.border}`,
              borderRadius: 0, cursor: "pointer", fontFamily: body, color: C.textDark,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              fontSize: 13, fontWeight: 600,
            }}
          >
            <span style={{ color: C.maroon }}>{icon}</span> {label}
          </button>
        ))}
      </div>

      {/* Latest Notices */}
      <h3 style={{ fontSize: 20, fontWeight: 700, color: C.textDark, margin: "0 0 12px", fontFamily: display, letterSpacing: 1 }}>Latest Notices</h3>
      {notices.map((n) => (
        <div key={n.id} style={{
          padding: "16px 20px", background: C.white, borderRadius: 0, border: `1px solid ${C.border}`,
          marginBottom: 10, borderLeft: n.pinned ? `3px solid ${C.maroon}` : undefined,
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.textDark, fontFamily: body }}>{n.title}</div>
          <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, margin: "6px 0 0", fontFamily: body }}>{n.body}</p>
        </div>
      ))}
    </div>
  );
}
