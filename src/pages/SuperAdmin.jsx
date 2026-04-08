import { useState, useEffect } from "react";
import Badge from "../components/ui/Badge";
import { ShieldIcon, CheckIcon, XIcon } from "../components/ui/Icons";
import { C, body, display } from "../theme";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function SuperAdmin() {
  const { profile } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState({ id: null, message: "", type: "" });

  const isSuperAdmin = profile?.role === "super_admin";

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, subscriptions(status)")
      .order("created_at", { ascending: false });
    if (!error) setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => { if (isSuperAdmin) fetchMembers(); }, [isSuperAdmin]);

  const setRole = async (memberId, newRole) => {
    if (memberId === profile.id) {
      alert("You cannot change your own role.");
      return;
    }
    setUpdating(memberId);
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", memberId);
    setUpdating(null);
    if (error) {
      setFeedback({ id: memberId, message: "Failed to update role.", type: "error" });
    } else {
      setFeedback({ id: memberId, message: `Role updated to ${newRole}.`, type: "success" });
      setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role: newRole } : m));
      setTimeout(() => setFeedback({ id: null, message: "", type: "" }), 3000);
    }
  };

  const filtered = members.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isSuperAdmin) return (
    <div style={{ padding: 40, textAlign: "center", color: C.textLight, fontFamily: body }}>
      <div style={{ fontSize: 20, color: C.textMid, fontFamily: display, letterSpacing: 1, marginBottom: 8 }}>Access Denied</div>
      <p style={{ fontSize: 13, fontFamily: body }}>This page is restricted to Super Admins.</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span style={{ color: C.maroon }}><ShieldIcon/></span>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textDark, margin: 0, fontFamily: display, letterSpacing: 1 }}>User Management</h2>
        <Badge color="maroon">Super Admin</Badge>
      </div>
      <p style={{ fontSize: 13, color: C.textLight, margin: "0 0 24px", fontFamily: body }}>
        Grant or revoke admin access for any member account.
      </p>

      {/* Role legend */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { role: "member", desc: "Standard member — can view content and book hall", color: "gold" },
          { role: "admin", desc: "Committee admin — can manage content and bookings", color: "gold" },
          { role: "super_admin", desc: "Super admin — full access including user management", color: "maroon" },
        ].map(({ role, desc, color }) => (
          <div key={role} style={{ padding: "10px 14px", background: C.white, border: `1px solid ${C.border}`, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Badge color={color}>{role === "super_admin" ? "Super Admin" : role === "admin" ? "Admin" : "Member"}</Badge>
            <span style={{ fontSize: 12, color: C.textMid, fontFamily: body }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", maxWidth: 360, padding: "10px 12px", border: `1px solid ${C.border}`,
            borderRadius: 0, fontSize: 13, fontFamily: body, color: C.textDark,
            background: C.white, outline: "none",
          }}
        />
      </div>

      {/* Members table */}
      {loading ? (
        <p style={{ color: C.textLight, fontFamily: body }}>Loading…</p>
      ) : (
        <div style={{ background: C.white, borderRadius: 0, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr 0.8fr 0.7fr 1.4fr", padding: "10px 16px", background: C.maroon, gap: 8 }}>
            {["Name", "Email", "Role", "Subscription", "Actions"].map((h) => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.white, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body }}>{h}</span>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: "20px 16px", fontSize: 13, color: C.textLight, fontFamily: body }}>No members found.</div>
          ) : filtered.map((m, i) => {
            const isSelf = m.id === profile.id;
            const subStatus = m.subscriptions?.[0]?.status;
            const isUpdating = updating === m.id;

            return (
              <div key={m.id} style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr 0.8fr 0.7fr 1.4fr", padding: "14px 16px", borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : C.cream, gap: 8, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, fontFamily: body }}>
                    {m.full_name || "—"}
                    {isSelf && <span style={{ fontSize: 10, color: C.textLight, fontFamily: body, marginLeft: 6 }}>(you)</span>}
                  </div>
                  {m.family_members && <div style={{ fontSize: 11, color: C.textLight, fontFamily: body, marginTop: 2 }}>{m.family_members}</div>}
                </div>
                <span style={{ fontSize: 12, color: C.textLight, fontFamily: body, wordBreak: "break-all" }}>{m.email}</span>
                <Badge color={m.role === "super_admin" ? "maroon" : m.role === "admin" ? "gold" : "gold"}>
                  {m.role === "super_admin" ? "Super Admin" : m.role === "admin" ? "Admin" : "Member"}
                </Badge>
                <Badge color={subStatus === "active" ? "green" : subStatus === "cancelled" ? "red" : "gold"}>
                  {subStatus === "active" ? "Active" : subStatus === "cancelled" ? "Cancelled" : "None"}
                </Badge>

                {isSelf ? (
                  <span style={{ fontSize: 12, color: C.textLight, fontFamily: body, fontStyle: "italic" }}>Cannot edit own role</span>
                ) : feedback.id === m.id ? (
                  <span style={{ fontSize: 12, color: feedback.type === "success" ? C.green : C.red, fontFamily: body }}>{feedback.message}</span>
                ) : (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {m.role !== "admin" && m.role !== "super_admin" && (
                      <button
                        onClick={() => setRole(m.id, "admin")}
                        disabled={isUpdating}
                        style={{ padding: "5px 10px", background: C.goldMuted, color: C.gold, border: `1px solid ${C.gold}`, borderRadius: 0, cursor: isUpdating ? "not-allowed" : "pointer", fontFamily: body, fontSize: 11, fontWeight: 600, opacity: isUpdating ? 0.6 : 1 }}
                      >
                        {isUpdating ? "…" : "Make Admin"}
                      </button>
                    )}
                    {m.role === "admin" && (
                      <button
                        onClick={() => setRole(m.id, "member")}
                        disabled={isUpdating}
                        style={{ padding: "5px 10px", background: "rgba(192,57,43,0.08)", color: C.red, border: `1px solid ${C.red}`, borderRadius: 0, cursor: isUpdating ? "not-allowed" : "pointer", fontFamily: body, fontSize: 11, fontWeight: 600, opacity: isUpdating ? 0.6 : 1 }}
                      >
                        {isUpdating ? "…" : "Revoke Admin"}
                      </button>
                    )}
                    {m.role !== "super_admin" && (
                      <button
                        onClick={() => {
                          if (confirm(`Promote ${m.full_name} to Super Admin? They will have full access including user management.`)) {
                            setRole(m.id, "super_admin");
                          }
                        }}
                        disabled={isUpdating}
                        style={{ padding: "5px 10px", background: "rgba(140,26,17,0.08)", color: C.maroon, border: `1px solid ${C.maroon}`, borderRadius: 0, cursor: isUpdating ? "not-allowed" : "pointer", fontFamily: body, fontSize: 11, fontWeight: 600, opacity: isUpdating ? 0.6 : 1 }}
                      >
                        {isUpdating ? "…" : "Make Super Admin"}
                      </button>
                    )}
                    {m.role === "super_admin" && (
                      <button
                        onClick={() => {
                          if (confirm(`Demote ${m.full_name} from Super Admin to regular member?`)) {
                            setRole(m.id, "member");
                          }
                        }}
                        disabled={isUpdating}
                        style={{ padding: "5px 10px", background: "rgba(192,57,43,0.08)", color: C.red, border: `1px solid ${C.red}`, borderRadius: 0, cursor: isUpdating ? "not-allowed" : "pointer", fontFamily: body, fontSize: 11, fontWeight: 600, opacity: isUpdating ? 0.6 : 1 }}
                      >
                        {isUpdating ? "…" : "Revoke Super Admin"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 24, padding: "14px 16px", background: C.goldMuted, border: `1px solid ${C.goldLight}`, fontSize: 12, color: C.textMid, fontFamily: body }}>
        <strong style={{ color: C.textDark }}>Note:</strong> Role changes take effect immediately. Members may need to refresh their browser to see updated access. Initial admin accounts are set directly in Supabase; ongoing changes are managed from this page.
      </div>
    </div>
  );
}
