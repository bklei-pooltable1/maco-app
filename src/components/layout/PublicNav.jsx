import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SunIcon } from "../ui/Icons";
import { C, body, display } from "../../theme";
import { useDemo } from "../../context/DemoContext";

export default function PublicNav() {
  const navigate = useNavigate();
  const { role } = useDemo();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else navigate(`/#${id}`);
    setMobileOpen(false);
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
  const publicNavLinks = [
    { label: "EVENTS", id: "events" },
    { label: "NOTICES", id: "notices" },
    { label: "HALL HIRE", id: "membership" },
    { label: "ABOUT", id: "about" },
  ];

  return (
    <>
      <nav className="public-nav-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 48px", maxWidth: 1000, margin: "0 auto", width: "100%", boxSizing: "border-box", position: "relative", zIndex: 2 }}>
        <div style={{ width: 120 }}>
          <span style={{ color: C.goldBright }}><SunIcon s={28}/></span>
        </div>
        <div className="nav-desktop-links" style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {publicNavLinks.map(({ label, id }) => (
            <span key={label} className="nav-link" onClick={() => scrollTo(id)} style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: body, letterSpacing: 1.2 }}>
              {label}
            </span>
          ))}
        </div>
        <div className="nav-auth-buttons" style={{ width: 180, textAlign: "right", display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0 }}>
          <button className="btn-outline" onClick={() => navigate("/login")} style={{ width: 80, padding: "9px 0", background: "transparent", color: C.white, border: "1px solid rgba(255,255,255,0.25)", borderRadius: 0, fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: body, whiteSpace: "nowrap" }}>
            Sign In
          </button>
          <button className="btn-gold" onClick={() => navigate("/signup")} style={{ width: 80, padding: "9px 0", background: C.goldBright, color: C.maroonDeep, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: body, whiteSpace: "nowrap" }}>
            Join Now
          </button>
        </div>

        {/* Hamburger — hidden on desktop, shown on mobile via CSS */}
        <button
          className="hamburger-btn"
          onClick={() => setMobileOpen(true)}
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: C.white, padding: 8, alignItems: "center", justifyContent: "center" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </nav>

      {/* Mobile full-screen menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed", inset: 0, background: C.maroonDeep, zIndex: 9999,
          display: "flex", flexDirection: "column", padding: "20px 24px",
          overflowY: "auto",
        }}>
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
            <span style={{ color: C.goldBright }}><SunIcon s={28}/></span>
            <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.white, fontSize: 32, lineHeight: 1, padding: 4 }}>
              ×
            </button>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {publicNavLinks.map(({ label, id }) => (
              <button
                key={label}
                onClick={() => scrollTo(id)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: C.white, fontSize: 24, fontWeight: 600,
                  fontFamily: display, padding: "16px 0", textAlign: "left",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  letterSpacing: 1,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Auth buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 36 }}>
            <button
              onClick={() => { navigate("/login"); setMobileOpen(false); }}
              style={{
                width: "100%", padding: "16px", background: "transparent",
                color: C.white, border: "1px solid rgba(255,255,255,0.3)",
                fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: body,
                minHeight: 52,
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { navigate("/signup"); setMobileOpen(false); }}
              style={{
                width: "100%", padding: "16px", background: C.goldBright,
                color: C.maroonDeep, border: "none",
                fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: body,
                minHeight: 52,
              }}
            >
              Join Now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
