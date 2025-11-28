import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1f2937",
        accent: "#0ea5e9",
        warning: "#f97316",
        danger: "#ef4444",
        success: "#22c55e"
      }
    }
  },
  plugins: []
};

export default config;
