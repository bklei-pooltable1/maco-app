import { useNavigate } from "react-router-dom";
import Section from "../ui/Section";
import SectionTitle from "../ui/SectionTitle";
import SunRays from "../ui/SunRays";
import { C, body, display } from "../../theme";

const tiers = [
  {
    name: "Individual",
    price: "$60",
    period: "/year",
    desc: "Perfect for single members",
    features: ["Members-only events", "Community directory", "10% off hall hire", "Newsletter access"],
    popular: false,
  },
  {
    name: "Couple",
    price: "$90",
    period: "/year",
    desc: "For you and your partner",
    features: ["Everything in Individual", "2 member profiles", "15% off hall hire", "Priority event booking"],
    popular: true,
  },
  {
    name: "Family",
    price: "$120",
    period: "/year",
    desc: "Whole family covered",
    features: ["Everything in Couple", "Unlimited family members", "20% off hall hire", "Youth program access"],
    popular: false,
  },
];

export default function MembershipCTA() {
  const navigate = useNavigate();

  return (
    <Section bg="#3a0907" style={{ position: "relative", overflow: "hidden" }}>
      <div id="membership"/>
      <div style={{ position: "absolute", top: -40, right: 60 }}><SunRays size={160} opacity={0.05}/></div>
      <div style={{ textAlign: "center", position: "relative" }}>
        <SectionTitle sub="Join Us" light center>Become a Member Today</SectionTitle>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 520, margin: "-12px auto 36px", fontFamily: body }}>
          Get access to exclusive events, members-only content, hall hire discounts, and stay connected all year round.
        </p>
        <div className="membership-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, maxWidth: 800, margin: "0 auto 36px" }}>
          {tiers.map((tier, i) => (
            <div key={i} style={{
              background: tier.popular ? "rgba(234,191,61,0.12)" : "rgba(255,255,255,0.07)",
              border: tier.popular ? `2px solid ${C.goldBright}` : "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16, padding: "32px 24px", position: "relative",
            }}>
              {tier.popular && (
                <div style={{
                  position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
                  background: C.goldBright, color: C.maroonDeep, padding: "4px 16px",
                  borderRadius: 20, fontSize: 10, fontWeight: 700, fontFamily: body,
                  letterSpacing: 1, textTransform: "uppercase",
                }}>
                  Most Popular
                </div>
              )}
              <div style={{ fontSize: 22, fontWeight: 700, color: C.goldBright, fontFamily: display, letterSpacing: 1, marginBottom: 8 }}>
                {tier.name}
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 40, fontWeight: 700, color: C.white, fontFamily: display }}>{tier.price}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: body }}>{tier.period}</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: body, marginBottom: 20 }}>{tier.desc}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, textAlign: "left" }}>
                {tier.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: body }}>
                    <span style={{ color: C.goldBright, fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button
                className={tier.popular ? "btn-gold" : "btn-outline"}
                onClick={() => navigate("/signup")}
                style={{
                  width: "100%", padding: "12px 0",
                  background: tier.popular ? C.goldBright : "transparent",
                  color: tier.popular ? C.maroonDeep : C.white,
                  border: tier.popular ? "none" : "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: body,
                }}
              >
                Join Now
              </button>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: body }}>
          Secure payments. Cancel anytime.
        </div>
      </div>
    </Section>
  );
}
