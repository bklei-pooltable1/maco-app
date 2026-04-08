import { useEffect, useRef } from "react";
import heroImg from "../../assets/hero.jpg";
import PublicNav from "../layout/PublicNav";
import { C, body, display } from "../../theme";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      const offset = window.scrollY * 0.4;
      el.style.backgroundPositionY = `calc(50% + ${offset}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      ref={heroRef}
      className="parallax-hero"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%), url(${heroImg})`,
        minHeight: "85vh", position: "relative", display: "flex", flexDirection: "column",
      }}
    >
      <PublicNav/>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="hero-inner" style={{ maxWidth: 960, padding: "0 24px", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{
            display: "inline-block", padding: "5px 18px", borderRadius: 0, fontSize: 10, fontWeight: 700,
            background: "rgba(216,167,55,0.15)", color: C.goldBright, letterSpacing: 2.5,
            textTransform: "uppercase", marginBottom: 28, fontFamily: body,
          }}>
            Macedonian Community of Brisbane
          </div>
          <h1 className="hero-h1" style={{
            color: C.white, fontSize: 46, fontWeight: 700, lineHeight: 1.15,
            margin: "0 auto 22px", maxWidth: 680, fontFamily: display, letterSpacing: 2,
          }}>
            Faith, Culture &<br/>Community Together
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.8,
            margin: "0 auto 40px", maxWidth: 480, fontFamily: body, fontWeight: 400,
          }}>
            Preserving our Macedonian Orthodox traditions while building a vibrant, connected community for families across Brisbane.
          </p>
          <div className="hero-buttons-row" style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            <button
              className="btn-gold"
              onClick={() => navigate("/signup")}
              style={{
                padding: "14px 36px", background: C.goldBright, color: C.maroonDeep,
                border: "none", borderRadius: 0, fontWeight: 700, fontSize: 14,
                cursor: "pointer", fontFamily: body,
              }}
            >
              Become a Member
            </button>
            <button
              className="btn-outline"
              onClick={() => scrollTo("events")}
              style={{
                padding: "14px 36px", background: "transparent", color: C.white,
                border: "1px solid rgba(255,255,255,0.25)", borderRadius: 0,
                fontWeight: 500, fontSize: 14, cursor: "pointer", fontFamily: body,
              }}
            >
              View Events
            </button>
          </div>
        </div>
      </div>
      <div style={{ background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.1)", position: "relative", zIndex: 2 }}>
        <div className="hero-stats-row" style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-between", padding: "28px 48px", width: "100%", boxSizing: "border-box" }}>
          {[["47+", "Member Families"], ["120+", "Community Members"], ["50+", "Events Per Year"]].map(([n, l], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.goldBright, fontFamily: display, letterSpacing: 1 }}>{n}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, fontFamily: body, fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
