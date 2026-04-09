import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { SunIcon } from "../components/ui/Icons";
import { C, body, display } from "../theme";
import { useAuth } from "../context/AuthContext";

const inputStyle = {
  width: "100%", padding: "11px 14px", border: `1px solid ${C.border}`,
  borderRadius: 0, fontSize: 13, fontFamily: body, color: C.textDark,
  background: C.white, outline: "none",
};

const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600, color: C.textMid,
  marginBottom: 6, fontFamily: body, textTransform: "uppercase", letterSpacing: 0.5,
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup fields
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [familyMembers, setFamilyMembers] = useState("");

  const { signIn, signUp, user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      if (profile.role === "admin" || profile.role === "super_admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, profile]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn({ email: loginEmail, password: loginPassword });
    setLoading(false);
    if (error) setError(error.message);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (signupPassword !== signupConfirm) {
      setError("Passwords do not match.");
      return;
    }
    if (signupPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { error } = await signUp({
      email: signupEmail,
      password: signupPassword,
      fullName,
      phone,
      familyMembers,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Account created! Check your email to confirm, then sign in.");
      setTab("login");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: C.maroon, padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `2px solid ${C.goldBright}` }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{ color: C.goldBright }}><SunIcon s={20}/></span>
          <span style={{ color: C.white, fontWeight: 700, fontSize: 14, fontFamily: display, letterSpacing: 1 }}>
            Macedonian Community of Brisbane
          </span>
        </Link>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={{ color: C.maroon }}><SunIcon s={44}/></span>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textDark, fontFamily: display, letterSpacing: 1.5, marginTop: 12 }}>
              {tab === "login" ? "Member Sign In" : "Create Account"}
            </h1>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", marginBottom: 28, border: `1px solid ${C.border}`, background: C.white }}>
            {["login", "signup"].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                style={{
                  flex: 1, padding: "11px 0", border: "none", borderRadius: 0,
                  background: tab === t ? C.maroon : "transparent",
                  color: tab === t ? C.white : C.textMid,
                  fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: body,
                  textTransform: "uppercase", letterSpacing: 1,
                }}
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: "rgba(192,57,43,0.08)", border: `1px solid ${C.red}`, color: C.red, padding: "10px 14px", fontSize: 13, fontFamily: body, marginBottom: 20 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: C.greenLight, border: `1px solid ${C.green}`, color: C.green, padding: "10px 14px", fontSize: 13, fontFamily: body, marginBottom: 20 }}>
              {success}
            </div>
          )}

          <div style={{ background: C.white, border: `1px solid ${C.border}`, padding: 28 }}>
            {tab === "login" ? (
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Email</label>
                  <input type="email" required style={inputStyle} value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="your@email.com"/>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>Password</label>
                  <input type="password" required style={inputStyle} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••"/>
                </div>
                <div style={{ textAlign: "right", marginBottom: 20 }}>
                  <button type="button" onClick={() => { setShowForgot(true); setForgotSent(false); setForgotEmail(""); }} style={{ background: "none", border: "none", color: C.maroon, fontSize: 12, cursor: "pointer", fontFamily: body, textDecoration: "underline", padding: 0 }}>
                    Forgot Password?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", padding: "13px 0", background: C.maroon, color: C.white,
                    border: "none", borderRadius: 0, fontWeight: 700, fontSize: 14,
                    cursor: loading ? "not-allowed" : "pointer", fontFamily: body, opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" required style={inputStyle} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Aleksandar Petrovski"/>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Email</label>
                  <input type="email" required style={inputStyle} value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="your@email.com"/>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Phone</label>
                  <input type="tel" style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0412 345 678"/>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Family Members</label>
                  <input type="text" style={inputStyle} value={familyMembers} onChange={(e) => setFamilyMembers(e.target.value)} placeholder="e.g. Aleksandar, Marija, Stefan (3 members)"/>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Password</label>
                  <input type="password" required style={inputStyle} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Min. 8 characters"/>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Confirm Password</label>
                  <input type="password" required style={inputStyle} value={signupConfirm} onChange={(e) => setSignupConfirm(e.target.value)} placeholder="Repeat password"/>
                </div>
                <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, marginBottom: 20, padding: "10px 14px", background: C.goldMuted, border: `1px solid ${C.goldLight}` }}>
                  After registering you'll be prompted to subscribe — $120/year covers your whole family.
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", padding: "13px 0", background: C.maroon, color: C.white,
                    border: "none", borderRadius: 0, fontWeight: 700, fontSize: 14,
                    cursor: loading ? "not-allowed" : "pointer", fontFamily: body, opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Creating account…" : "Create Account"}
                </button>
              </form>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Link to="/" style={{ fontSize: 12, color: C.textLight, fontFamily: body, textDecoration: "none" }}>
              ← Back to home
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: C.white, width: "100%", maxWidth: 400, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: display, fontSize: 18, color: C.textDark, margin: 0, letterSpacing: 0.5 }}>Reset Password</h3>
              <button onClick={() => setShowForgot(false)} style={{ background: "none", border: "none", fontSize: 22, color: C.textLight, cursor: "pointer", padding: "0 4px" }}>×</button>
            </div>
            {forgotSent ? (
              <div>
                <div style={{ background: C.greenLight, border: `1px solid ${C.green}`, color: C.green, padding: "12px 16px", fontSize: 13, fontFamily: body, marginBottom: 16 }}>
                  ✓ If that email is registered, you'll receive a password reset link shortly.
                </div>
                <button onClick={() => setShowForgot(false)} style={{ width: "100%", padding: "12px 0", background: C.maroon, color: C.white, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: body }}>
                  Back to Sign In
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: C.textMid, fontFamily: body, lineHeight: 1.6, marginBottom: 20 }}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <div style={{ marginBottom: 6 }}>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" style={inputStyle} value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="your@email.com"/>
                </div>
                <div style={{ background: C.goldMuted, border: `1px solid ${C.goldLight}`, padding: "10px 14px", fontSize: 12, color: C.textMid, fontFamily: body, marginBottom: 20 }}>
                  {/* TODO: Connect to Supabase auth.resetPasswordForEmail() when backend is live */}
                  Password reset will be available once Supabase auth is connected. For now, please contact us at <strong>MacedonianCommunityOfBrisbane@gmail.com</strong>.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setShowForgot(false)} style={{ flex: 1, padding: "12px 0", background: "transparent", border: `1px solid ${C.border}`, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: body, color: C.textMid }}>
                    Cancel
                  </button>
                  <button onClick={() => setForgotSent(true)} disabled={!forgotEmail.trim()} style={{ flex: 1, padding: "12px 0", background: C.maroon, color: C.white, border: "none", fontWeight: 700, fontSize: 13, cursor: forgotEmail.trim() ? "pointer" : "not-allowed", fontFamily: body, opacity: forgotEmail.trim() ? 1 : 0.6 }}>
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
