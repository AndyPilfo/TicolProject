import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brandBlue: "#004AAD",
        brandOrange: "#fa7801",
        brandBrown: "#70432d",
        textLight: "#2E2D2D",
        bgDark: "#2E2D2D"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.10)"
      }
    }
  },
  plugins: []
} satisfies Config;

