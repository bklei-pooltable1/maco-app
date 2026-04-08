import { Link, useNavigate } from "react-router-dom";
import { SunIcon } from "../ui/Icons";
import { C, body, display } from "../../theme";
import { useDemo } from "../../context/DemoContext";

export default function PublicNav() {
  const navigate = useNavigate();
  const { role } = useDemo();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else navigate(`/#${id}`);
  };

  // Member nav links
  if (role === "member") {
    return (
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 48px", maxWidth: 1000, margin: "0 auto", width: "100%", boxSizing: "border-box", position: "relative", zIndex: 2 }}>
        <div style={{ width: 120 }}>
          <span style={{ color: C.goldBright }}><SunIcon s={28}/></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {[
            { label: "HOME", onClick: () => navigate("/") },
            { label: "DASHBOARD", onClick: () => navigate("/member-dashboard") },
            { label: "CALENDAR", onClick: () => navigate("/member-dashboard") },
            { label: "NOTICE BOARD", onClick: () => navigate("/member-dashboard") },
            { label: "HALL HIRE", onClick: () => navigate("/member-dashboard") },
          ].map(({ label, onClick }) => (
            <span key={label} className="nav-link" onClick={onClick} style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: body, letterSpacing: 1.2 }}>
              {label}
            </span>
          ))}
        </div>
        <div style={{ width: 120, textAlign: "right", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn-outline" onClick={() => navigate("/member-dashboard")} style={{ padding: "9px 18px", background: "transparent", color: C.white, border: "1px solid rgba(255,255,255,0.25)", borderRadius: 0, fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: body }}>
            My Profile
          </button>
          <button className="btn-gold" onClick={() => navigate("/")} style={{ padding: "9px 16px", background: C.goldBright, color: C.maroonDeep, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: body }}>
            Sign Out
          </button>
        </div>
      </nav>
    );
  }

  // Admin nav links
  if (role === "admin") {
    return (
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 48px", maxWidth: 1000, margin: "0 auto", width: "100%", boxSizing: "border-box", position: "relative", zIndex: 2 }}>
        <div style={{ width: 120 }}>
          <span style={{ color: C.goldBright }}><SunIcon s={28}/></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {[
            { label: "HOME", onClick: () => navigate("/") },
            { label: "ADMIN PANEL", onClick: () => navigate("/admin-dashboard") },
          ].map(({ label, onClick }) => (
            <span key={label} className="nav-link" onClick={onClick} style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: body, letterSpacing: 1.2 }}>
              {label}
            </span>
          ))}
        </div>
        <div style={{ width: 120, textAlign: "right" }}>
          <button className="btn-gold" onClick={() => navigate("/")} style={{ padding: "9px 22px", background: C.goldBright, color: C.maroonDeep, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: body }}>
            Sign Out
          </button>
        </div>
      </nav>
    );
  }

  // Default public nav
  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 48px", maxWidth: 1000, margin: "0 auto", width: "100%", boxSizing: "border-box", position: "relative", zIndex: 2 }}>
      <div style={{ width: 120 }}>
        <span style={{ color: C.goldBright }}><SunIcon s={28}/></span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        {[
          { label: "EVENTS", id: "events" },
          { label: "NOTICES", id: "notices" },
          { label: "HALL HIRE", id: "membership" },
          { label: "ABOUT", id: "about" },
        ].map(({ label, id }) => (
          <span key={label} className="nav-link" onClick={() => scrollTo(id)} style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: body, letterSpacing: 1.2 }}>
            {label}
          </span>
        ))}
      </div>
      <div style={{ width: 120, textAlign: "right", display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn-outline" onClick={() => navigate("/login")} style={{ padding: "9px 16px", background: "transparent", color: C.white, border: "1px solid rgba(255,255,255,0.25)", borderRadius: 0, fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: body }}>
          Sign In
        </button>
        <button className="btn-gold" onClick={() => navigate("/signup")} style={{ padding: "9px 16px", background: C.goldBright, color: C.maroonDeep, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: body }}>
          Join Now
        </button>
      </div>
    </nav>
  );
}
