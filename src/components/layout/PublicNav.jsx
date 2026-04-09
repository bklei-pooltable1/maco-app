import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SunIcon } from "../ui/Icons";
import { C, body, display } from "../../theme";
import { useDemo } from "../../context/DemoContext";
import { useLang } from "../../context/LangContext";

// EN / MK toggle button
function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.2)", overflow: "hidden" }}>
      {["en", "mk"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: "5px 10px", border: "none", borderRadius: 0, cursor: "pointer",
            background: lang === l ? "rgba(234,191,61,0.25)" : "transparent",
            color: lang === l ? C.goldBright : "rgba(255,255,255,0.45)",
            fontWeight: lang === l ? 700 : 500, fontSize: 11, fontFamily: body,
            letterSpacing: 0.5, textTransform: "uppercase",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function PublicNav() {
  const navigate = useNavigate();
  const { role } = useDemo();
  const { t } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else navigate(`/#${id}`);
    setMobileOpen(false);
  };

  // ── Member nav ────────────────────────────────────────────────────────────
  if (role === "member") {
    return (
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 48px", maxWidth: 1000, margin: "0 auto", width: "100%", boxSizing: "border-box", position: "relative", zIndex: 2 }}>
        <div style={{ width: 120 }}>
          <span style={{ color: C.goldBright }}><SunIcon s={28}/></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {[
            { label: t("nav.home"),         onClick: () => navigate("/") },
            { label: t("nav.dashboard"),    onClick: () => navigate("/member-dashboard") },
            { label: t("nav.calendar"),     onClick: () => navigate("/calendar") },
            { label: t("nav.noticeBoard"),  onClick: () => navigate("/member-dashboard") },
            { label: t("nav.hallHire"),     onClick: () => navigate("/calendar#book-hall") },
          ].map(({ label, onClick }) => (
            <span key={label} className="nav-link" onClick={onClick} style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: body, letterSpacing: 1.2 }}>
              {label}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <LangToggle/>
          <button className="btn-outline" onClick={() => navigate("/member-dashboard")} style={{ padding: "9px 18px", background: "transparent", color: C.white, border: "1px solid rgba(255,255,255,0.25)", borderRadius: 0, fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: body }}>
            {t("nav.myProfile")}
          </button>
          <button className="btn-gold" onClick={() => navigate("/")} style={{ padding: "9px 16px", background: C.goldBright, color: C.maroonDeep, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: body }}>
            {t("nav.signOut")}
          </button>
        </div>
      </nav>
    );
  }

  // ── Admin nav ─────────────────────────────────────────────────────────────
  if (role === "admin") {
    return (
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 48px", maxWidth: 1000, margin: "0 auto", width: "100%", boxSizing: "border-box", position: "relative", zIndex: 2 }}>
        <div style={{ width: 120 }}>
          <span style={{ color: C.goldBright }}><SunIcon s={28}/></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {[
            { label: t("nav.home"),       onClick: () => navigate("/") },
            { label: t("nav.adminPanel"), onClick: () => navigate("/admin-dashboard") },
          ].map(({ label, onClick }) => (
            <span key={label} className="nav-link" onClick={onClick} style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: body, letterSpacing: 1.2 }}>
              {label}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <LangToggle/>
          <button className="btn-gold" onClick={() => navigate("/")} style={{ padding: "9px 22px", background: C.goldBright, color: C.maroonDeep, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: body }}>
            {t("nav.signOut")}
          </button>
        </div>
      </nav>
    );
  }

  // ── Public nav ────────────────────────────────────────────────────────────
  const publicNavLinks = [
    { label: t("nav.events"),   id: "events" },
    { label: t("nav.notices"),  id: "notices" },
    { label: t("nav.hallHire"), onClick: () => navigate("/calendar#book-hall") },
    { label: t("nav.about"),    id: "about" },
  ];

  return (
    <>
      <nav className="public-nav-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 48px", maxWidth: 1000, margin: "0 auto", width: "100%", boxSizing: "border-box", position: "relative", zIndex: 2 }}>
        <div style={{ width: 120 }}>
          <span style={{ color: C.goldBright }}><SunIcon s={28}/></span>
        </div>
        <div className="nav-desktop-links" style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {publicNavLinks.map(({ label, id, onClick: customClick }) => (
            <span key={label} className="nav-link" onClick={customClick || (() => scrollTo(id))} style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: body, letterSpacing: 1.2 }}>
              {label}
            </span>
          ))}
        </div>
        <div className="nav-auth-buttons" style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <LangToggle/>
          <button className="btn-outline" onClick={() => navigate("/login")} style={{ width: 72, padding: "9px 0", background: "transparent", color: C.white, border: "1px solid rgba(255,255,255,0.25)", borderRadius: 0, fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: body, whiteSpace: "nowrap" }}>
            {t("nav.signIn")}
          </button>
          <button className="btn-gold" onClick={() => navigate("/signup")} style={{ width: 88, padding: "9px 0", background: C.goldBright, color: C.maroonDeep, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: body, whiteSpace: "nowrap" }}>
            {t("nav.joinNow")}
          </button>
        </div>

        {/* Hamburger */}
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed", inset: 0, background: C.maroonDeep, zIndex: 9999,
          display: "flex", flexDirection: "column", padding: "20px 24px",
          overflowY: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
            <span style={{ color: C.goldBright }}><SunIcon s={28}/></span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <LangToggle/>
              <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.white, fontSize: 32, lineHeight: 1, padding: 4 }}>×</button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {publicNavLinks.map(({ label, id, onClick: customClick }) => (
              <button
                key={label}
                onClick={customClick ? () => { customClick(); setMobileOpen(false); } : () => scrollTo(id)}
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
              {t("nav.signIn")}
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
              {t("nav.joinNow")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
