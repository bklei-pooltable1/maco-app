import { C } from "../../theme";

export default function SunRays({ size = 120, opacity = 0.06 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ position: "absolute", opacity }}>
      <circle cx="60" cy="60" r="20" fill={C.goldBright}/>
      {[...Array(8)].map((_, i) => {
        const a = (i * 45) * Math.PI / 180;
        return (
          <line
            key={i}
            x1={60 + 26 * Math.cos(a)} y1={60 + 26 * Math.sin(a)}
            x2={60 + 55 * Math.cos(a)} y2={60 + 55 * Math.sin(a)}
            stroke={C.goldBright} strokeWidth="6" strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
