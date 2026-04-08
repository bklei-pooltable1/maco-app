import { useNavigate } from "react-router-dom";
import { SunIcon, BellIcon, LogOutIcon } from "../ui/Icons";
import { C, body, display } from "../../theme";
import { useAuth } from "../../context/AuthContext";

export default function AppNav() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const roleLabel =
    profile?.role === "super_admin" ? "Super Admin" :
    profile?.role === "admin" ? "Committee Admin" :
    "Member Portal";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div style={{
      background: C.maroon, padding: "0 20px", display: "flex", alignItems: "center",
      justifyContent: "space-between", height: 52, borderBottom: `2px solid ${C.goldBright}`,
      position: "sticky", top: 36, zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: C.goldBright }}><SunIcon s={20}/></span>
        <span style={{ color: C.white, fontWeight: 700, fontSize: 14, fontFamily: display, letterSpacing: 1 }}>
          Macedonian Community of Brisbane
        </span>
        <span style={{
          fontSize: 10, color: "rgba(255,255,255,0.5)", marginLeft: 8, padding: "3px 10px",
          borderRadius: 0, background: "rgba(255,255,255,0.08)", fontWeight: 600, fontFamily: body,
        }}>
          {roleLabel}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ color: "rgba(255,255,255,0.5)" }}><BellIcon/></span>
        <div style={{
          width: 30, height: 30, borderRadius: "50%", background: C.goldBright,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: C.maroonDeep, fontFamily: body,
        }}>
          {initials}
        </div>
        <button
          onClick={handleSignOut}
          title="Sign out"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center",
            padding: 4,
          }}
        >
          <LogOutIcon/>
        </button>
      </div>
    </div>
  );
}
