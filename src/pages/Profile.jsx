import { useState } from "react";
import Badge from "../components/ui/Badge";
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

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    family_members: profile?.family_members || "",
  });
  const [success, setSuccess] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  useState(() => {
    if (!profile) return;
    supabase.from("subscriptions").select("*").eq("user_id", profile.id).single().then(({ data }) => {
      setSubscription(data);
      setSubLoading(false);
    });
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      phone: form.phone,
      family_members: form.family_members,
    }).eq("id", profile.id);
    setSaving(false);
    if (!error) {
      refreshProfile();
      setEditing(false);
      setSuccess("Profile updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

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

  const subActive = subscription?.status === "active";
  const subExpiry = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textDark, margin: "0 0 20px", fontFamily: display, letterSpacing: 1 }}>My Family Profile</h2>

      {success && (
        <div style={{ background: "rgba(45,138,78,0.1)", border: `1px solid ${C.green}`, color: C.green, padding: "10px 14px", fontSize: 13, fontFamily: body, marginBottom: 16 }}>
          {success}
        </div>
      )}

      {/* Profile card */}
      <div style={{ background: C.white, borderRadius: 0, border: `1px solid ${C.border}`, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: C.textDark, margin: 0, fontFamily: body }}>Family Details</h3>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Badge color={subActive ? "green" : "red"}>{subActive ? "Active Member" : "No Subscription"}</Badge>
            {!editing && (
              <button onClick={() => { setEditing(true); setForm({ full_name: profile?.full_name || "", phone: profile?.phone || "", family_members: profile?.family_members || "" }); }} style={{ padding: "6px 14px", background: "transparent", color: C.maroon, border: `1px solid ${C.maroon}`, borderRadius: 0, fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: body }}>
                Edit
              </button>
            )}
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" required style={inputStyle} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}/>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Phone</label>
              <input type="tel" style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}/>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Family Members</label>
              <input type="text" style={inputStyle} value={form.family_members} onChange={(e) => setForm({ ...form, family_members: e.target.value })} placeholder="e.g. Name1, Name2 (2 members)"/>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={saving} style={{ padding: "10px 22px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: body, opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditing(false)} style={{ padding: "10px 22px", background: "transparent", color: C.textMid, border: `1px solid ${C.border}`, borderRadius: 0, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: body }}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            {[
              ["Primary Contact", profile?.full_name],
              ["Email", profile?.email],
              ["Phone", profile?.phone || "—"],
              ["Family Members", profile?.family_members || "—"],
              ["Member Since", profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-AU", { month: "long", year: "numeric" }) : "—"],
              ["Subscription", subActive ? `$120/year${subExpiry ? ` — renews ${subExpiry}` : ""}` : "No active subscription"],
            ].map(([l, v], i, arr) => (
              <div key={l} style={{ display: "flex", padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ width: 180, fontSize: 13, fontWeight: 600, color: C.textLight, fontFamily: body }}>{l}</span>
                <span style={{ fontSize: 13, color: C.textDark, fontFamily: body }}>{v}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Subscription */}
      <div style={{ background: C.white, borderRadius: 0, border: `1px solid ${C.border}`, padding: 24 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, color: C.textDark, margin: "0 0 16px", fontFamily: body }}>Subscription</h3>
        {subLoading ? (
          <p style={{ fontSize: 13, color: C.textLight, fontFamily: body }}>Loading…</p>
        ) : subActive ? (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <Badge color="green">Active</Badge>
              <Badge>Family Plan — $120/year</Badge>
            </div>
            {subExpiry && <p style={{ fontSize: 13, color: C.textMid, fontFamily: body, marginBottom: 16 }}>Renews: {subExpiry}</p>}
            <button
              onClick={handleSubscribe}
              style={{ padding: "10px 20px", background: C.goldBright, color: C.maroonDeep, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: body }}
            >
              Manage Subscription via Stripe
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 13, color: C.textMid, fontFamily: body, marginBottom: 16 }}>You don't have an active subscription. Subscribe to unlock full member access.</p>
            <button
              onClick={handleSubscribe}
              style={{ padding: "12px 28px", background: C.maroon, color: C.white, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: body }}
            >
              Subscribe — $120/year →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
