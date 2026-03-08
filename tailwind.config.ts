import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0A0A0F",
          secondary: "#12121A",
          surface: "#171722",
          hover: "#1D1D2B",
        },
        accent: {
          primary: "#60A5FA",
          secondary: "#818CF8",
        },
        "text-primary": "#F1F5F9",
        "text-secondary": "#A8B3C7",
        "text-muted": "#64748B",
        "border-subtle": "rgba(255,255,255,0.08)",
        "border-strong": "rgba(255,255,255,0.14)",
        success: "#34D399",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-jakarta)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      maxWidth: {
        content: "1280px",
        article: "768px",
      },
      borderRadius: {
        card: "16px",
      },
      spacing: {
        section: "6rem",
        "section-mobile": "4.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
