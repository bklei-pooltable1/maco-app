import { C, body } from "../../theme";
import { useLang } from "../../context/LangContext";

function SquareToggle({ active, onChange }) {
  const TRACK_W = 42, TRACK_H = 22, KNOB = 18;
  return (
    <button
      onClick={() => onChange(!active)}
      aria-pressed={active}
      style={{
        display: "inline-flex",
        alignItems: "center",
        position: "relative",
        width: TRACK_W,
        height: TRACK_H,
        background: active ? C.goldBright : C.border,
        border: "none",
        borderRadius: 0,
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
        transition: "background 0.15s",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: active ? TRACK_W - KNOB - 2 : 2,
          width: KNOB,
          height: KNOB,
          background: active ? C.maroon : C.white,
          borderRadius: 0,
          transition: "left 0.15s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}
      />
    </button>
  );
}

export default function NotificationPrefs({ categories, prefs, onToggle, contactInfo }) {
  const { t } = useLang();

  return (
    <div style={{ fontFamily: body }}>
      {contactInfo && (
        <div style={{ marginBottom: 20, padding: "12px 14px", background: C.cream, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, color: C.textMid, fontFamily: body }}>
            {contactInfo.email}{contactInfo.phone ? ` · ${contactInfo.phone}` : ""}
          </div>
          <div style={{ fontSize: 12, color: C.textLight, fontFamily: body, marginTop: 4 }}>
            {t("notifications.contactHint")}
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", paddingBottom: 10, marginBottom: 4, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ flex: 1 }} />
        <div style={{ width: 80, textAlign: "center", fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body }}>
          {t("notifications.email")}
        </div>
        <div style={{ width: 80, textAlign: "center", fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: body }}>
          {t("notifications.sms")}
        </div>
      </div>

      {categories.map(({ key, labelKey }) => {
        const label = t(labelKey ?? `notifications.${key}`);
        const catPrefs = prefs?.[key] ?? { email: true, sms: false };
        return (
          <div
            key={key}
            className="notif-pref-row"
            style={{ display: "flex", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${C.border}` }}
          >
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.textDark, fontFamily: body }}>
              {label}
            </div>
            <div style={{ width: 80, display: "flex", justifyContent: "center" }}>
              <SquareToggle active={catPrefs.email} onChange={(val) => onToggle(key, "email", val)} />
            </div>
            <div style={{ width: 80, display: "flex", justifyContent: "center" }}>
              <SquareToggle active={catPrefs.sms} onChange={(val) => onToggle(key, "sms", val)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
