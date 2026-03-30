/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#1e1b4b",
        },
        risk: {
          low:    "#22c55e",
          medium: "#f59e0b",
          high:   "#ef4444",
        },
      },
      fontFamily: {
        sans:  ["Inter", "ui-sans-serif", "system-ui"],
        kiosk: ["Montserrat", "ui-sans-serif", "system-ui"],
      },
      animation: {
        "scroll-up": "scrollUp 20s linear infinite",
        "fade-in":   "fadeIn 0.3s ease-in-out",
        "badge-pop": "badgePop 0.4s cubic-bezier(0.68,-0.55,0.27,1.55)",
      },
      keyframes: {
        scrollUp: {
          "0%":   { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
        fadeIn: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        badgePop: {
          "0%":   { transform: "scale(0)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
