export const C = {
  maroon: "#8C1A11",
  maroonDark: "#6B1410",
  maroonDeep: "#4A0E0A",
  gold: "#D8A737",
  goldBright: "#EABF3D",
  goldLight: "#F5E6B8",
  goldMuted: "rgba(216,167,55,0.12)",
  cream: "#FBF8F1",
  white: "#ffffff",
  textDark: "#2D1810",
  textMid: "#6B5248",
  textLight: "#A08878",
  border: "#E8DDD3",
  red: "#c0392b",
  green: "#2D8A4E",
  greenLight: "rgba(45,138,78,0.1)",
};

export const display = "'Cinzel', 'Times New Roman', Georgia, serif";
export const body = "'Montserrat', -apple-system, sans-serif";

export const globalStyles = `
  ::selection { background: #EABF3D; color: #4A0E0A; }
  ::-moz-selection { background: #EABF3D; color: #4A0E0A; }
  .parallax-hero {
    background-position: center 50%;
    background-size: cover;
    background-repeat: no-repeat;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Montserrat', -apple-system, sans-serif; }
  button { font-family: 'Montserrat', -apple-system, sans-serif; }
  input, textarea, select { font-family: 'Montserrat', -apple-system, sans-serif; }
  .scroll-anchor {
    scroll-margin-top: 100px;
  }
  .nav-link {
    transition: color 0.2s ease-in-out;
  }
  .nav-link:hover {
    color: #ffffff !important;
  }
  .btn-gold {
    transition: all 0.2s ease-in-out;
  }
  .btn-gold:hover {
    background: #b8911f !important;
  }
  .btn-outline {
    transition: all 0.2s ease-in-out;
  }
  .btn-outline:hover {
    background: #4A0E0A !important;
    color: #ffffff !important;
    border-color: #4A0E0A !important;
  }
`;
