import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#e0e7ff",
          400: "#6366f1",
          500: "#4f46e5", // Professional blue (less bright than before)
          600: "#4338ca",
          700: "#3730a3",
          900: "#1e1b4b",
        },
        accent: "#f59e0b", // Warm amber (more professional than yellow)
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        canvas: "#ffffff",
        "canvas-dark": "#0f172a",
        ink: "#1f2937",
        "ink-light": "#6b7280",
        surface: "#f9fafb",
        "surface-dark": "#1f2937",
        border: "#d1d5db",
        "border-dark": "#374151",
      },
      boxShadow: {
        float: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        glass: "0 10px 30px rgba(0, 0, 0, 0.08)",
        card: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
        hover: "0 20px 25px -5px rgba(0, 0, 0, 0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
        "3xl": "1.5rem",
      },
      backgroundImage: {
        "gradient-subtle": "linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%)",
        "gradient-dark": "linear-gradient(135deg, rgba(31, 41, 55, 0.5) 0%, rgba(15, 23, 42, 0.5) 100%)",
      },
      animation: {
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
        "drift": "drift 7s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        "drift": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "slide-up": {
          "from": { transform: "translateY(10px)", opacity: "0" },
          "to": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "from": { opacity: "0" },
          "to": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
