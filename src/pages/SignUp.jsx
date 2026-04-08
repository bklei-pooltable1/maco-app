import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, body, display } from "../theme";
import { SunIcon, CheckIcon } from "../components/ui/Icons";
import { useDemo } from "../context/DemoContext";
import { getPricing } from "../data/mockData";

const STEPS = ["Account", "Family", "Plan", "Payment", "Done"];

const inputStyle = {
  width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`,
  borderRadius: 0, fontSize: 13, fontFamily: body, color: C.textDark,
  background: C.white, outline: "none", boxSizing: "border-box",
};

const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600, color: C.textMid,
  marginBottom: 6, fontFamily: body,
};

function StepIndicator({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 36 }}>
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                fontFamily: body,
                background: done ? C.green : active ? C.maroon : C.border,
                color: done || active ? C.white : C.textLight,
              }}>
                {done ? <CheckIcon/> : i + 1}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: active ? C.maroon : done ? C.green : C.textLight, fontFamily: body, whiteSpace: "nowrap" }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 1, background: done ? C.green : C.border, margin: "0 8px", marginBottom: 20 }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Account Details ─────────────────────────────────────────────────
function Step1({ data, onChange, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.firstName.trim()) e.firstName = "Required";
    if (!data.lastName.trim()) e.lastName = "Required";
    if (!data.email.trim()) e.email = "Required";
    if (!data.password || data.password.length < 6) e.password = "Min 6 characters";
    if (!data.phone.trim()) e.phone = "Required";
    if (!data.dateOfBirth) e.dateOfBirth = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div>
      <h2 style={{ fontFamily: display, fontSize: 22, color: C.textDark, marginBottom: 6, letterSpacing: 1 }}>Account Details</h2>
      <p style={{ fontSize: 13, color: C.textMid, marginBottom: 28, fontFamily: body }}>Set up your login credentials and personal information.</p>
      <div className="step-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={labelStyle}>First Name *</label>
          <input style={{ ...inputStyle, borderColor: errors.firstName ? C.red : C.border }} value={data.firstName} onChange={e => onChange("firstName", e.target.value)} placeholder="Marija"/>
          {errors.firstName && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.firstName}</span>}
        </div>
        <div>
          <label style={labelStyle}>Last Name *</label>
          <input style={{ ...inputStyle, borderColor: errors.lastName ? C.red : C.border }} value={data.lastName} onChange={e => onChange("lastName", e.target.value)} placeholder="Petrovska"/>
          {errors.lastName && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.lastName}</span>}
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Email Address *</label>
          <input style={{ ...inputStyle, borderColor: errors.email ? C.red : C.border }} value={data.email} type="email" onChange={e => onChange("email", e.target.value)} placeholder="marija@email.com"/>
          {errors.email && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.email}</span>}
        </div>
        <div>
          <label style={labelStyle}>Password *</label>
          <input style={{ ...inputStyle, borderColor: errors.password ? C.red : C.border }} value={data.password} type="password" onChange={e => onChange("password", e.target.value)} placeholder="Min 6 characters"/>
          {errors.password && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.password}</span>}
        </div>
        <div>
          <label style={labelStyle}>Phone Number *</label>
          <input style={{ ...inputStyle, borderColor: errors.phone ? C.red : C.border }} value={data.phone} onChange={e => onChange("phone", e.target.value)} placeholder="0412 345 678"/>
          {errors.phone && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.phone}</span>}
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Date of Birth *</label>
          <input style={{ ...inputStyle, borderColor: errors.dateOfBirth ? C.red : C.border }} value={data.dateOfBirth} type="date" onChange={e => onChange("dateOfBirth", e.target.value)}/>
          {errors.dateOfBirth && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.dateOfBirth}</span>}
        </div>
      </div>
      <div className="signup-step-nav" style={{ marginTop: 28, textAlign: "right", display: "flex", justifyContent: "flex-end" }}>
        <button className="btn-gold" onClick={() => validate() && onNext()} style={{ padding: "12px 32px", background: C.goldBright, color: C.maroonDeep, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: body }}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Family Details ───────────────────────────────────────────────────
function Step2({ data, onChange, onNext, onBack }) {
  const addMember = () => onChange("familyMembers", [...data.familyMembers, { name: "", age: "" }]);
  const removeMember = (i) => onChange("familyMembers", data.familyMembers.filter((_, idx) => idx !== i));
  const updateFamilyMember = (i, field, val) => {
    const updated = data.familyMembers.map((m, idx) => idx === i ? { ...m, [field]: val } : m);
    onChange("familyMembers", updated);
  };
  const totalSize = 1 + data.familyMembers.length;

  return (
    <div>
      <h2 style={{ fontFamily: display, fontSize: 22, color: C.textDark, marginBottom: 6, letterSpacing: 1 }}>Family Details</h2>
      <p style={{ fontSize: 13, color: C.textMid, marginBottom: 28, fontFamily: body }}>Tell us about your household so we can set up your membership correctly.</p>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Your Suburb / Area *</label>
        <input style={inputStyle} value={data.suburb} onChange={e => onChange("suburb", e.target.value)} placeholder="e.g. New Farm, Hamilton, Ascot"/>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <label style={{ ...labelStyle, marginBottom: 2 }}>Additional Family Members</label>
            <span style={{ fontSize: 11, color: C.textLight, fontFamily: body }}>Add others in your household who will be included in your membership</span>
          </div>
          <button onClick={addMember} style={{ padding: "7px 14px", background: C.cream, border: `1px solid ${C.border}`, borderRadius: 0, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: body, color: C.textDark }}>
            + Add Member
          </button>
        </div>

        {data.familyMembers.length === 0 && (
          <div style={{ padding: "16px", border: `1px dashed ${C.border}`, background: C.cream, fontSize: 12, color: C.textLight, fontFamily: body, textAlign: "center" }}>
            No additional members — Individual membership
          </div>
        )}

        {data.familyMembers.map((fm, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 32px", gap: 10, marginBottom: 10, alignItems: "center" }}>
            <input style={inputStyle} value={fm.name} onChange={e => updateFamilyMember(i, "name", e.target.value)} placeholder={`Member ${i + 2} name`}/>
            <input style={inputStyle} type="number" value={fm.age} onChange={e => updateFamilyMember(i, "age", e.target.value)} placeholder="Age" min="0" max="120"/>
            <button onClick={() => removeMember(i)} style={{ padding: "10px", background: "rgba(192,57,43,0.08)", border: "none", borderRadius: 0, cursor: "pointer", color: C.red, fontSize: 16, fontWeight: 700 }}>×</button>
          </div>
        ))}
      </div>

      <div style={{ padding: "12px 16px", background: C.goldMuted, border: `1px solid ${C.gold}`, fontFamily: body }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>Total household: </span>
        <span style={{ fontSize: 13, color: C.textMid }}>{totalSize} {totalSize === 1 ? "person" : "people"}</span>
        <span style={{ fontSize: 12, color: C.textLight, marginLeft: 12 }}>({totalSize === 1 ? "Individual" : totalSize === 2 ? "Couple" : `Family`} plan)</span>
      </div>

      <div className="signup-step-nav" style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
        <button onClick={onBack} style={{ padding: "12px 28px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 0, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: body, color: C.textMid }}>
          ← Back
        </button>
        <button className="btn-gold" onClick={onNext} style={{ padding: "12px 32px", background: C.goldBright, color: C.maroonDeep, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: body }}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Plan Selection ───────────────────────────────────────────────────
function Step3({ data, onChange, familySize, onNext, onBack }) {
  const [billing, setBilling] = useState("yearly");
  const pricing = getPricing(familySize);
  const savings = Math.round((pricing.monthlyPrice * 12 - pricing.yearlyPrice));

  return (
    <div>
      <h2 style={{ fontFamily: display, fontSize: 22, color: C.textDark, marginBottom: 6, letterSpacing: 1 }}>Your Membership Plan</h2>
      <p style={{ fontSize: 13, color: C.textMid, marginBottom: 24, fontFamily: body }}>Based on your household size of {familySize} {familySize === 1 ? "person" : "people"}, here is your personalised pricing.</p>

      {/* Billing toggle */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
        <div style={{ display: "flex", border: `1px solid ${C.border}`, overflow: "hidden" }}>
          {["monthly", "yearly"].map((b) => (
            <button key={b} onClick={() => { setBilling(b); onChange("billingCycle", b); }} style={{
              padding: "9px 24px", border: "none", borderRadius: 0, cursor: "pointer", fontFamily: body,
              fontWeight: 600, fontSize: 12, letterSpacing: 0.5,
              background: billing === b ? C.maroon : C.white,
              color: billing === b ? C.white : C.textMid,
            }}>
              {b === "yearly" ? "YEARLY" : "MONTHLY"}
              {b === "yearly" && <span style={{ marginLeft: 8, fontSize: 10, background: C.green, color: C.white, padding: "2px 6px", borderRadius: 2 }}>SAVE {Math.round(savings / (pricing.monthlyPrice * 12) * 100)}%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Plan card */}
      <div style={{ border: `2px solid ${C.maroon}`, padding: 28, background: C.white, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: C.textLight, fontFamily: body, textTransform: "uppercase", marginBottom: 6 }}>Selected Plan</div>
            <div style={{ fontFamily: display, fontSize: 24, color: C.textDark, letterSpacing: 1 }}>{pricing.label}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: display, fontSize: 40, color: C.maroon, lineHeight: 1 }}>
              ${billing === "yearly" ? pricing.yearlyPrice : pricing.monthlyPrice}
            </div>
            <div style={{ fontSize: 13, color: C.textLight, fontFamily: body }}>/{billing === "yearly" ? "year" : "month"}</div>
          </div>
        </div>

        <div style={{ background: C.cream, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: C.textLight, fontFamily: body, marginBottom: 3 }}>Household Members</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.textDark, fontFamily: body }}>{familySize}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.textLight, fontFamily: body, marginBottom: 3 }}>Per person / year</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.textDark, fontFamily: body }}>${(pricing.yearlyPrice / familySize).toFixed(2)}</div>
            </div>
            {billing === "yearly" && savings > 0 && (
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 11, color: C.textLight, fontFamily: body, marginBottom: 3 }}>Annual saving vs monthly</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.green, fontFamily: body }}>Save ${savings}/year</div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        {[
          "Full member portal access",
          "RSVP to events",
          "Community notice board",
          familySize >= 3 ? "20% off hall hire" : familySize === 2 ? "15% off hall hire" : "10% off hall hire",
          familySize >= 3 ? "Youth program access" : null,
        ].filter(Boolean).map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ color: C.green, fontWeight: 700, fontSize: 14 }}>✓</span>
            <span style={{ fontSize: 13, color: C.textMid, fontFamily: body }}>{f}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, marginBottom: 24 }}>
        You can cancel or change your plan at any time from your member portal.
      </div>

      <div className="signup-step-nav" style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ padding: "12px 28px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 0, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: body, color: C.textMid }}>
          ← Back
        </button>
        <button className="btn-gold" onClick={() => { onChange("pricing", { ...pricing, billingCycle: billing }); onNext(); }} style={{ padding: "12px 32px", background: C.goldBright, color: C.maroonDeep, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: body }}>
          Continue to Payment →
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Mock Payment ─────────────────────────────────────────────────────
function Step4({ data, onNext, onBack, pricing }) {
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const formatCard = (val) => val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const validate = () => {
    const e = {};
    if (card.number.replace(/\s/g, "").length < 16) e.number = "Enter a valid 16-digit card number";
    if (card.expiry.length < 5) e.expiry = "Enter expiry in MM/YY format";
    if (card.cvv.length < 3) e.cvv = "Enter 3-digit CVV";
    if (!card.name.trim()) e.name = "Name on card required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onNext();
    }, 1800);
  };

  const billingCycle = data.billingCycle || "yearly";
  const price = billingCycle === "yearly" ? pricing.yearlyPrice : pricing.monthlyPrice;

  return (
    <div>
      <h2 style={{ fontFamily: display, fontSize: 22, color: C.textDark, marginBottom: 6, letterSpacing: 1 }}>Payment Details</h2>
      <p style={{ fontSize: 13, color: C.textMid, marginBottom: 24, fontFamily: body }}>Secure payment powered by Stripe. Your card details are encrypted and never stored.</p>

      {/* Order summary */}
      <div style={{ padding: "14px 18px", background: C.cream, border: `1px solid ${C.border}`, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, fontFamily: body }}>{pricing.label} — {billingCycle === "yearly" ? "Annual" : "Monthly"}</div>
          <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, marginTop: 3 }}>{1 + data.familyMembers.length} member{1 + data.familyMembers.length > 1 ? "s" : ""} · {data.email}</div>
        </div>
        <div style={{ fontFamily: display, fontSize: 22, color: C.maroon }}>${price}<span style={{ fontSize: 13, color: C.textLight, fontFamily: body }}>/{billingCycle === "yearly" ? "yr" : "mo"}</span></div>
      </div>

      {/* Stripe-style card form */}
      <div style={{ border: `1px solid ${C.border}`, background: C.white, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
          <label style={labelStyle}>Card Number</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              style={{ ...inputStyle, border: "none", padding: "4px 0", flex: 1 }}
              value={card.number}
              onChange={e => setCard(p => ({ ...p, number: formatCard(e.target.value) }))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
            <span style={{ fontSize: 20 }}>💳</span>
          </div>
          {errors.number && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.number}</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ padding: "14px 16px", borderRight: `1px solid ${C.border}` }}>
            <label style={labelStyle}>Expiry Date</label>
            <input style={{ ...inputStyle, border: "none", padding: "4px 0" }} value={card.expiry} onChange={e => setCard(p => ({ ...p, expiry: formatExpiry(e.target.value) }))} placeholder="MM/YY" maxLength={5}/>
            {errors.expiry && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.expiry}</span>}
          </div>
          <div style={{ padding: "14px 16px" }}>
            <label style={labelStyle}>CVV</label>
            <input style={{ ...inputStyle, border: "none", padding: "4px 0" }} value={card.cvv} type="password" onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) }))} placeholder="•••" maxLength={3}/>
            {errors.cvv && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.cvv}</span>}
          </div>
        </div>
        <div style={{ padding: "14px 16px" }}>
          <label style={labelStyle}>Name on Card</label>
          <input style={{ ...inputStyle, border: "none", padding: "4px 0" }} value={card.name} onChange={e => setCard(p => ({ ...p, name: e.target.value }))} placeholder="Marija Petrovska"/>
          {errors.name && <span style={{ fontSize: 11, color: C.red, fontFamily: body }}>{errors.name}</span>}
        </div>
      </div>

      <div style={{ fontSize: 11, color: C.textLight, fontFamily: body, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
        🔒 Your payment is secured with 256-bit SSL encryption
      </div>

      <div className="signup-step-nav" style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={onBack} disabled={processing} style={{ padding: "12px 28px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 0, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: body, color: C.textMid, opacity: processing ? 0.5 : 1 }}>
          ← Back
        </button>
        <button className="btn-gold" onClick={handleSubmit} disabled={processing} style={{ padding: "12px 36px", background: processing ? C.maroon : C.goldBright, color: processing ? C.white : C.maroonDeep, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 13, cursor: processing ? "default" : "pointer", fontFamily: body, minWidth: 180 }}>
          {processing ? "Processing…" : `Pay $${price}/${billingCycle === "yearly" ? "yr" : "mo"}`}
        </button>
      </div>
    </div>
  );
}

// ─── Step 5: Success ──────────────────────────────────────────────────────────
function Step5({ data, onGoToDashboard }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.greenLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>
        ✓
      </div>
      <h2 style={{ fontFamily: display, fontSize: 26, color: C.textDark, marginBottom: 10, letterSpacing: 1 }}>Welcome to the Community!</h2>
      <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.7, maxWidth: 420, margin: "0 auto 28px", fontFamily: body }}>
        Your membership is now active, {data.firstName}. You'll receive a confirmation email at <strong>{data.email}</strong>.
      </p>
      <div style={{ background: C.cream, border: `1px solid ${C.border}`, padding: "18px 24px", maxWidth: 360, margin: "0 auto 32px", textAlign: "left" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.textLight, letterSpacing: 1, fontFamily: body, marginBottom: 12, textTransform: "uppercase" }}>Membership Summary</div>
        {[
          ["Name", `${data.firstName} ${data.lastName}`],
          ["Plan", data.pricing?.label || ""],
          ["Billing", data.billingCycle === "yearly" ? "Annual" : "Monthly"],
          ["Status", "Active"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontFamily: body }}>
            <span style={{ color: C.textLight }}>{k}</span>
            <span style={{ color: k === "Status" ? C.green : C.textDark, fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
      <button className="btn-gold" onClick={onGoToDashboard} style={{ padding: "14px 40px", background: C.goldBright, color: C.maroonDeep, border: "none", borderRadius: 0, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: body }}>
        Go to My Dashboard →
      </button>
    </div>
  );
}

// ─── Main SignUp Component ────────────────────────────────────────────────────
export default function SignUp() {
  const navigate = useNavigate();
  const { addMember, setCurrentMember, setRole } = useDemo();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    firstName: "", lastName: "", email: "", password: "", phone: "", dateOfBirth: "",
    suburb: "", familyMembers: [],
    billingCycle: "yearly", pricing: null,
  });

  const onChange = (field, value) => setData((prev) => ({ ...prev, [field]: value }));
  const familySize = 1 + data.familyMembers.length;
  const pricing = getPricing(familySize);

  const handleComplete = () => {
    const newMember = {
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      suburb: data.suburb,
      familySize,
      familyMembers: data.familyMembers,
      planType: pricing.label,
      yearlyPrice: pricing.yearlyPrice,
      monthlyPrice: pricing.monthlyPrice,
      billingCycle: data.billingCycle || "yearly",
      joinDate: new Date().toISOString().split("T")[0],
      renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "active",
      paymentMethod: "Stripe",
    };
    const created = addMember(newMember);
    setCurrentMember({ ...newMember, id: created.id });
    setStep(4);
  };

  const goToDashboard = () => {
    setRole("member");
    navigate("/member-dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", background: C.cream, paddingTop: 60 }}>
      {/* Header */}
      <div className="signup-header" style={{ background: C.maroon, padding: "18px 48px", display: "flex", alignItems: "center", gap: 12, position: "fixed", top: 36, left: 0, right: 0, zIndex: 100, height: 52, boxSizing: "border-box", borderBottom: `2px solid ${C.goldBright}` }}>
        <span style={{ color: C.goldBright }}><SunIcon s={20}/></span>
        <span style={{ color: C.white, fontWeight: 700, fontSize: 14, fontFamily: display, letterSpacing: 1 }}>Macedonian Community of Brisbane</span>
        <span className="signup-header-title" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginLeft: 8, fontFamily: body }}>New Member Registration</span>
        <div style={{ marginLeft: "auto" }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 12, fontFamily: body, fontWeight: 500 }}>
            ← Back to Home
          </button>
        </div>
      </div>

      <div className="signup-body" style={{ maxWidth: 600, margin: "80px auto 60px", padding: "0 24px" }}>
        <div className="signup-card" style={{ background: C.white, border: `1px solid ${C.border}`, padding: "36px 40px" }}>
          <StepIndicator current={step}/>

          {step === 0 && <Step1 data={data} onChange={onChange} onNext={() => setStep(1)}/>}
          {step === 1 && <Step2 data={data} onChange={onChange} onNext={() => setStep(2)} onBack={() => setStep(0)}/>}
          {step === 2 && <Step3 data={data} onChange={onChange} familySize={familySize} onNext={() => setStep(3)} onBack={() => setStep(1)}/>}
          {step === 3 && <Step4 data={data} onNext={handleComplete} onBack={() => setStep(2)} pricing={pricing}/>}
          {step === 4 && <Step5 data={data} onGoToDashboard={goToDashboard}/>}
        </div>
      </div>
    </div>
  );
}
