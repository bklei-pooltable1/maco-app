import { useNavigate, useLocation } from "react-router-dom";
import { HomeIcon, CalIcon, BuildingIcon, UsersIcon, BellIcon, SettingsIcon, ShieldIcon } from "../ui/Icons";
import { C, body } from "../../theme";
import { useAuth } from "../../context/AuthContext";

const memberLinks = [
  { path: "/dashboard", icon: <HomeIcon/>, label: "Dashboard" },
  { path: "/noticeboard", icon: <BellIcon/>, label: "Notice Board" },
  { path: "/events", icon: <CalIcon/>, label: "Events" },
  { path: "/venue-booking", icon: <BuildingIcon/>, label: "Book the Hall" },
  { path: "/profile", icon: <UsersIcon/>, label: "My Profile" },
];

const adminLinks = [
  { path: "/dashboard", icon: <HomeIcon/>, label: "Dashboard" },
  { path: "/noticeboard", icon: <BellIcon/>, label: "Notice Board" },
  { path: "/events", icon: <CalIcon/>, label: "Events" },
  { path: "/venue-booking", icon: <BuildingIcon/>, label: "Hall Bookings" },
  { path: "/admin", icon: <SettingsIcon/>, label: "Admin Panel" },
  { path: "/profile", icon: <UsersIcon/>, label: "My Profile" },
];

const superAdminLinks = [
  { path: "/dashboard", icon: <HomeIcon/>, label: "Dashboard" },
  { path: "/noticeboard", icon: <BellIcon/>, label: "Notice Board" },
  { path: "/events", icon: <CalIcon/>, label: "Events" },
  { path: "/venue-booking", icon: <BuildingIcon/>, label: "Hall Bookings" },
  { path: "/admin", icon: <SettingsIcon/>, label: "Admin Panel" },
  { path: "/super-admin", icon: <ShieldIcon/>, label: "User Management" },
  { path: "/profile", icon: <UsersIcon/>, label: "My Profile" },
];

export default function Sidebar() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links =
    profile?.role === "super_admin" ? superAdminLinks :
    profile?.role === "admin" ? adminLinks :
    memberLinks;

  return (
    <div style={{
      width: 200, background: C.white, borderRight: `1px solid ${C.border}`,
      padding: "16px 10px", minHeight: "calc(100vh - 52px)",
      flexShrink: 0,
    }}>
      {links.map((l) => {
        const active = location.pathname === l.path;
        return (
          <button
            key={l.path}
            onClick={() => navigate(l.path)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              border: "none", background: active ? "rgba(140,26,17,0.08)" : "transparent",
              borderRadius: 0, width: "100%",
              color: active ? C.maroon : C.textMid,
              fontSize: 13, fontWeight: active ? 600 : 500,
              cursor: "pointer", textAlign: "left", fontFamily: body,
            }}
          >
            {l.icon} {l.label}
          </button>
        );
      })}
    </div>
  );
}
