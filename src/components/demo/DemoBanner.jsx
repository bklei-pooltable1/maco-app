import { useNavigate } from "react-router-dom";
import { useDemo } from "../../context/DemoContext";
import { body } from "../../theme";

const ROLES = [
  { key: "public", label: "Public" },
  { key: "member", label: "Member" },
  { key: "admin", label: "Admin" },
];

const ROLE_PATHS = {
  public: "/",
  member: "/member-dashboard",
  admin: "/admin-dashboard",
};

export default function DemoBanner() {
  const { role, setRole } = useDemo();
  const navigate = useNavigate();

  const switchRole = (newRole) => {
    setRole(newRole);
    navigate(ROLE_PATHS[newRole]);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
      background: "#111", borderBottom: "1px solid #333",
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 12, height: 36, fontFamily: body,
    }}>
      <span style={{ fontSize: 11, color: "#888", letterSpacing: 0.5, fontWeight: 500 }}>
        DEMO — View as:
      </span>
      {ROLES.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => switchRole(key)}
          style={{
            padding: "4px 14px", fontSize: 11, fontWeight: 700,
            letterSpacing: 0.5, cursor: "pointer", border: "none",
            borderRadius: 2, fontFamily: body, transition: "all 0.15s",
            background: role === key ? "#D8A737" : "rgba(255,255,255,0.08)",
            color: role === key ? "#111" : "#aaa",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
