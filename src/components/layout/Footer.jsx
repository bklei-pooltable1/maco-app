import { SunIcon, MapPinIcon, MailIcon } from "../ui/Icons";
import { C, body, display } from "../../theme";

export default function Footer() {
  return (
    <div style={{ background: "#3a0907", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "44px 24px 28px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 32, marginBottom: 36 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ color: C.goldBright }}><SunIcon s={20}/></span>
              <span style={{ color: C.white, fontWeight: 700, fontSize: 14, fontFamily: display, letterSpacing: 1 }}>
                Macedonian Community of Brisbane
              </span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.75, fontFamily: body }}>
              Preserving our Macedonian Orthodox faith, culture, and traditions for future generations.
            </p>
          </div>
          {[
            ["Quick Links", ["Home", "Events", "Notice Board", "Hall Hire", "About"]],
            ["Members", ["Sign In", "Join Now", "Member Events", "My Profile"]],
          ].map(([title, links]) => (
            <div key={title}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.goldBright, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14, fontFamily: body }}>
                {title}
              </div>
              {links.map((l) => (
                <div key={l} style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 9, cursor: "pointer", fontFamily: body }}>
                  {l}
                </div>
              ))}
            </div>
          ))}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.goldBright, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14, fontFamily: body }}>
              Contact
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: body }}><MapPinIcon/> 142 James Street, New Farm, Brisbane, QLD</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: body }}><MailIcon/> MacedonianCommunityOfBrisbane@gmail.com</div>
            </div>
          </div>
        </div>
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20,
          textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: body,
        }}>
          © 2026 Macedonian Community of Brisbane. All rights reserved.
        </div>
      </div>
    </div>
  );
}
