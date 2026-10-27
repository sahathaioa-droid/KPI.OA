/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./performance.html",
    "./assets/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#c8102e",
          800: "#9f1239",
          900: "#881337",
          950: "#4c0519"
        },
        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          500: "#64748b",
          700: "#334155",
          900: "#0f172a"
        }
      },
      fontFamily: {
        sans: ["'Noto Sans Thai'", "system-ui", "-apple-system", "sans-serif"],
        display: ["'Prompt'", "'Noto Sans Thai'", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 16px 50px -28px rgba(136, 19, 55, 0.28)",
        card: "0 24px 70px -40px rgba(76, 5, 25, 0.38)",
        glow: "0 0 0 1px rgba(255,255,255,.1), 0 25px 60px -20px rgba(76,5,25,.55)"
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(at 85% 15%, rgba(251,113,133,.28) 0px, transparent 45%), radial-gradient(at 8% 85%, rgba(225,29,72,.2) 0px, transparent 38%), linear-gradient(135deg, #4c0519 0%, #881337 48%, #9f1239 100%)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up .65s cubic-bezier(.22,1,.36,1) both",
        shimmer: "shimmer 2.4s infinite"
      }
    }
  },
  plugins: []
};
