import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0B120E",      // page canvas
        pine: "#101A13",       // panels
        thicket: "#16241B",    // raised surfaces / hovers
        parchment: "#EFEBDC",  // primary text
        sage: "#8FA694",       // muted text
        signal: "#C9F14E",     // chlorophyll lime accent
        leaf: "#4FB878",       // positive / published
        "leaf-deep": "#1F6B45",
        ember: "#F0876C",      // errors / danger
        // legacy names still referenced by hosted-blog light theme
        porcelain: "#F7F5EC",
        ink: "#171F1A",
        moss: "#E4EBE0",
        bark: "#5C6B60",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        ring: {
          "0%": { transform: "scale(0.35)", opacity: "0.9" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: { "0%, 49%": { opacity: "1" }, "50%, 100%": { opacity: "0" } },
        tickerScroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        sweep: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        ring: "ring 2.4s cubic-bezier(0.2, 0.6, 0.4, 1) infinite",
        "fade-up": "fadeUp 0.7s cubic-bezier(0.2, 0.7, 0.3, 1) both",
        blink: "blink 1.1s steps(1) infinite",
        ticker: "tickerScroll 28s linear infinite",
        breathe: "breathe 2.6s ease-in-out infinite",
        sweep: "sweep 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
