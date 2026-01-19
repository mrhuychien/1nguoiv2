import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        background: {
          DEFAULT: "#0a0a0f",
          secondary: "#12121a",
          tertiary: "#1a1a24",
        },
        // Text colors
        text: {
          primary: "#e8e8ed",
          secondary: "#8888a0",
          muted: "#5c5c70",
        },
        // Brand colors
        cyan: {
          DEFAULT: "#00d4ff",
          50: "#e6fbff",
          100: "#ccf7ff",
          200: "#99efff",
          300: "#66e7ff",
          400: "#33dfff",
          500: "#00d4ff",
          600: "#00a9cc",
          700: "#007f99",
          800: "#005566",
          900: "#002a33",
        },
        purple: {
          DEFAULT: "#a855f7",
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7c22ce",
          800: "#6b21a8",
          900: "#581c87",
        },
        // Status colors
        success: "#22c55e",
        warning: "#eab308",
        danger: "#ef4444",
        // Border colors
        border: {
          DEFAULT: "#2a2a3c",
          hover: "#3a3a4c",
        },
      },
      fontFamily: {
        sans: ["var(--font-be-vietnam)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)",
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(0, 212, 255, 0.3)",
        "glow-purple": "0 0 20px rgba(168, 85, 247, 0.3)",
        "glow-primary": "0 0 30px rgba(0, 212, 255, 0.2), 0 0 60px rgba(168, 85, 247, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        // Zen animations
        "flow-glow": "flowGlow 3s ease-in-out infinite",
        "bell-ring": "bellRing 0.5s ease-in-out",
        "ripple": "ripple 1s ease-out forwards",
        "breathe": "breathe 4s ease-in-out infinite",
        "timer-pulse": "timerPulse 1s ease-in-out infinite",
        "zen-fade": "zenFade 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 212, 255, 0.5)" },
        },
        // Zen keyframes
        flowGlow: {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(34, 197, 94, 0.6), 0 0 80px rgba(34, 197, 94, 0.4)",
          },
        },
        bellRing: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "20%": { transform: "rotate(15deg)" },
          "40%": { transform: "rotate(-15deg)" },
          "60%": { transform: "rotate(10deg)" },
          "80%": { transform: "rotate(-10deg)" },
        },
        ripple: {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
        },
        timerPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        zenFade: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
