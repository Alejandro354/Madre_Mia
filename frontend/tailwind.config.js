/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF1837",
        "primary-light": "#FDECEF",
        sidebar: "#333333",
        background: "#FFFFFF",
        surface: "#F4F5FA",
        "text-primary": "#333333",
        "text-secondary": "#666666",
        border: "#E9EBF4",
        disabled: "#F0F2F7",
        "disabled-text": "#9A9FB5",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
