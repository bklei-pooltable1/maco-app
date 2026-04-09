import { Link, useNavigate } from "react-router-dom";
import { SunIcon, MapPinIcon, MailIcon } from "../ui/Icons";
import { C, body, display } from "../../theme";
import { useLang } from "../../context/LangContext";

export default function Footer() {
  const navigate = useNavigate();
  const { t } = useLang();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${id}`);
    }
  };

  const quickLinks = [
    { label: t("footer.links.home"),        action: () => navigate("/") },
    { label: t("footer.links.events"),      action: () => scrollTo("events") },
    { label: t("footer.links.noticeBoard"), action: () => scrollTo("notices") },
    { label: t("footer.links.hallHire"),    action: () => navigate("/calendar#book-hall") },
    { label: t("footer.links.about"),       action: () => scrollTo("about") },
  ];

  const memberLinks = [
    { label: t("footer.links.signIn"),       action: () => navigate("/login") },
    { label: t("footer.links.joinNow"),      action: () => navigate("/signup") },
    { label: t("footer.links.memberEvents"), action: () => navigate("/member-dashboard") },
    { label: t("footer.links.myProfile"),    action: () => navigate("/member-dashboard") },
  ];

  return (
    <div style={{ background: "#3a0907", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "44px 24px 28px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 32, marginBottom: 36 }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ color: C.goldBright }}><SunIcon s={20}/></span>
              <span style={{ color: C.white, fontWeight: 700, fontSize: 14, fontFamily: display, letterSpacing: 1 }}>
                Macedonian Community of Brisbane
              </span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.75, fontFamily: body }}>
              {t("footer.tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.goldBright, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14, fontFamily: body }}>
              {t("footer.quickLinks")}
            </div>
            {quickLinks.map(({ label, action }) => (
              <div key={label} onClick={action} style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 9, cursor: "pointer", fontFamily: body, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.75)"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Members */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.goldBright, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14, fontFamily: body }}>
              {t("footer.members")}
            </div>
            {memberLinks.map(({ label, action }) => (
              <div key={label} onClick={action} style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 9, cursor: "pointer", fontFamily: body, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.75)"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.goldBright, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14, fontFamily: body }}>
              {t("footer.contact")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="footer-contact-item" style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: body }}>
                <MapPinIcon/> 142 James Street, New Farm, Brisbane, QLD
              </div>
              <a href="mailto:MacedonianCommunityOfBrisbane@gmail.com" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: body, textDecoration: "none" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
              >
                <MailIcon/> MacedonianCommunityOfBrisbane@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20,
          textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: body,
        }}>
          {t("footer.rights")}
        </div>
      </div>
    </div>
  );
}
