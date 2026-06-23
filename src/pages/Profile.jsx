import { useState } from "react";
import Badge from "../components/ui/Badge";
import { C, body, display } from "../theme";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: C.textMid,
  textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body,
};

export default function Profile() {
  const { profile } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  useState(() => {
    if (!profile) return;
    supabase.from("subscriptions").select("*").eq("user_id", profile.id).single().then(({ data }) => {
      setSubscription(data);
      setSubLoading(false);
    });
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

  const subActive = subscription?.status === "active";
  const subExpiry = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textDark, margin: "0 0 20px", fontFamily: display, letterSpacing: 1 }}>My Family Profile</h2>

      {/* Profile card — read-only; contact admin to update details */}
      <div style={{ background: C.white, borderRadius: 0, border: `1px solid ${C.border}`, padding: 24, marginBottom: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: C.textDark, margin: 0, fontFamily: body }}>Family Details</h3>
          <Badge color={subActive ? "green" : "red"}>{subActive ? "Active Member" : "No Subscription"}</Badge>
        </div>

        {[
          ["Primary Contact", profile?.full_name],
          ["Email", profile?.email],
          ["Phone", profile?.phone || "—"],
          ["Address", profile?.address || "—"],
          ["Family Members", profile?.family_members || "—"],
          ["Member Since", profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-AU", { month: "long", year: "numeric" }) : "—"],
          ["Subscription", subActive ? `$120/year${subExpiry ? ` — renews ${subExpiry}` : ""}` : "No active subscription"],
        ].map(([l, v], i, arr) => (
          <div key={l} style={{ display: "flex", padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <span style={{ width: 180, fontSize: 13, fontWeight: 600, color: C.textLight, fontFamily: body }}>{l}</span>
            <span style={{ fontSize: 13, color: C.textDark, fontFamily: body }}>{v}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: C.textMid, fontFamily: body, margin: "12px 0 24px", lineHeight: 1.6 }}>
        If any of your details are incorrect, please contact an admin at{" "}
        <a href="mailto:MacedonianCommunityOfBrisbane@gmail.com" style={{ color: C.maroon, textDecoration: "none" }}>
          MacedonianCommunityOfBrisbane@gmail.com
        </a>{" "}
        to have them updated.
      </p>

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
