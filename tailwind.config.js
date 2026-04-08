/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: "#8C1A11",
        "maroon-dark": "#6B1410",
        "maroon-deep": "#4A0E0A",
        gold: "#D8A737",
        "gold-bright": "#EABF3D",
        "gold-light": "#F5E6B8",
        cream: "#FBF8F1",
        "text-dark": "#2D1810",
        "text-mid": "#6B5248",
        "text-light": "#A08878",
        border: "#E8DDD3",
        "community-green": "#2D8A4E",
      },
      fontFamily: {
        display: ["'Cinzel'", "'Times New Roman'", "Georgia", "serif"],
        body: ["'Montserrat'", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
