import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Section from "../ui/Section";
import SectionTitle from "../ui/SectionTitle";
import SunRays from "../ui/SunRays";
import { C, body, display } from "../../theme";
import { useLang } from "../../context/LangContext";
import { PRICING_TIERS } from "../../data/mockData";

// Family tier discount display (3–6+ members)
function familyPriceFor(memberCount) {
  const key = Math.min(Math.max(parseInt(memberCount) || 3, 3), 6);
  return PRICING_TIERS[key];
}

// Calculate base-3 per-member price vs actual price to show savings
function calcSavings(memberCount) {
  const base3PerPerson = PRICING_TIERS[3].yearlyPrice / 3; // $40 per person
  const actual = familyPriceFor(memberCount).yearlyPrice;
  const noDiscount = Math.round(base3PerPerson * memberCount);
  const saved = noDiscount - actual;
  const pct = Math.round((saved / noDiscount) * 100);
  return { saved, pct, noDiscount };
}

export default function MembershipCTA() {
  const navigate = useNavigate();
  const { t, lang, cyrillicDisplay } = useLang();
  const headingFont = lang === "mk" ? cyrillicDisplay : display;

  // Family member counter state (min 3 for family tier)
  const [familyCount, setFamilyCount] = useState(3);
  const familyPricing = familyPriceFor(familyCount);
  const { saved, pct } = calcSavings(familyCount);

  const tiers = [
    {
      name: "Individual",
      price: `$${PRICING_TIERS[1].yearlyPrice}`,
      period: "/year",
      desc: t("membership.tierDescs.Individual"),
      features: [
        "Members-only events",
        "Community directory",
        "10% off hall hire",
        "Newsletter access",
      ],
      popular: false,
      priceNode: null,
    },
    {
      name: "Couple",
      price: `$${PRICING_TIERS[2].yearlyPrice}`,
      period: "/year",
      desc: t("membership.tierDescs.Couple"),
      features: [
        "Everything in Individual",
        "2 member profiles",
        "15% off hall hire",
        "Priority event booking",
      ],
      popular: true,
      priceNode: null,
    },
    {
      name: "Family",
      price: null, // rendered dynamically
      period: "/year",
      desc: t("membership.tierDescs.Family"),
      features: [
        "Everything in Couple",
        "Unlimited family members",
        "20% off hall hire",
        "Youth program access",
      ],
      popular: false,
      priceNode: "dynamic",
    },
  ];

  return (
    <Section bg="#3a0907" style={{ position: "relative", overflow: "hidden" }}>
      <div id="membership"/>
      <div style={{ position: "absolute", top: -40, right: 60 }}><SunRays size={160} opacity={0.05}/></div>
      <div style={{ textAlign: "center", position: "relative" }}>
        <SectionTitle sub={t("membership.sectionSub")} light center>{t("membership.sectionTitle")}</SectionTitle>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 520, margin: "-12px auto 36px", fontFamily: body }}>
          {t("membership.subtext")}
        </p>

        <div className="membership-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, maxWidth: 840, margin: "0 auto 36px" }}>
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
                  letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap",
                }}>
                  {t("membership.mostPopular")}
                </div>
              )}

              <div style={{ fontSize: 22, fontWeight: 700, color: C.goldBright, fontFamily: headingFont, letterSpacing: 1, marginBottom: 8 }}>
                {tier.name}
              </div>

              {/* Price block */}
              {tier.priceNode === "dynamic" ? (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 36, fontWeight: 700, color: C.white, fontFamily: headingFont }}>${familyPricing.yearlyPrice}</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: body }}>/year</span>
                  </div>
                  {/* Family counter */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: body, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {t("membership.familyMembers")}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 0, justifyContent: "center" }}>
                      <button
                        onClick={() => setFamilyCount(c => Math.max(3, c - 1))}
                        style={{ width: 32, height: 32, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: C.white, fontSize: 18, cursor: familyCount <= 3 ? "not-allowed" : "pointer", fontFamily: body, opacity: familyCount <= 3 ? 0.4 : 1 }}
                      >−</button>
                      <span style={{ width: 40, textAlign: "center", fontSize: 18, fontWeight: 700, color: C.white, fontFamily: body }}>
                        {familyCount}
                      </span>
                      <button
                        onClick={() => setFamilyCount(c => Math.min(6, c + 1))}
                        style={{ width: 32, height: 32, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: C.white, fontSize: 18, cursor: familyCount >= 6 ? "not-allowed" : "pointer", fontFamily: body, opacity: familyCount >= 6 ? 0.4 : 1 }}
                      >+</button>
                    </div>
                    {familyCount === 6 && (
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: body, marginTop: 4 }}>6+ members</div>
                    )}
                  </div>
                  {/* Discount badge */}
                  {saved > 0 && (
                    <div style={{ background: "rgba(45,138,78,0.2)", border: "1px solid rgba(45,138,78,0.4)", borderRadius: 6, padding: "6px 10px", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#7FD4A0", fontFamily: body, fontWeight: 600 }}>
                        {t("membership.youSave")} ${saved}{t("membership.perYear")} ({pct}% off)
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 40, fontWeight: 700, color: C.white, fontFamily: headingFont }}>{tier.price}</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: body }}>{tier.period}</span>
                </div>
              )}

              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: body, marginBottom: tier.priceNode === "dynamic" ? 8 : 20 }}>{tier.desc}</div>

              {/* Same-address note for family */}
              {tier.priceNode === "dynamic" && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: body, marginBottom: 16, fontStyle: "italic" }}>
                  {t("membership.familySameAddress")}
                </div>
              )}

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
                {t("membership.joinNow")}
              </button>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: body }}>
          {t("membership.footer")}
        </div>
      </div>
    </Section>
  );
}
