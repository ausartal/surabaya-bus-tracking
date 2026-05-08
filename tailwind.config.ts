import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          500: "#1D4ED8",
          600: "#1b46c3",
          400: "#0EA5E9",
          300: "#7dd3fc",
          200: "#bae6fd",
        },
        accent: "#EAB308",
        canvas: "#F8FAFC",
        ink: "#0f172a",
      },
      boxShadow: {
        float: "0 30px 70px rgba(15, 23, 42, 0.15)",
        glass: "0 14px 40px rgba(15, 23, 42, 0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(14, 165, 233, 0.15), transparent 35%), radial-gradient(circle at bottom right, rgba(29, 78, 216, 0.14), transparent 28%)",
      },
      animation: {
        pulseSoft: "pulseSoft 2.4s ease-in-out infinite",
        drift: "drift 7s ease-in-out infinite",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.12)", opacity: "1" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
