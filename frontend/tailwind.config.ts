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
        background: "var(--background)",
        foreground: "var(--foreground)",
        pitch: {
          DEFAULT: "#1a472a",
          light: "#22c55e",
          dark: "#0f3118",
        },
        gold: {
          DEFAULT: "#fbbf24",
          dark: "#f59e0b",
        },
      },
    },
  },
  plugins: [],
};
export default config;
