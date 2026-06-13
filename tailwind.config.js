/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#fafafa",
          100: "#e7e5e4",
          400: "#78716c",
          600: "#44403c",
          800: "#27272a",
          900: "#18181b",
        },
        paper: {
          DEFAULT: "#f7f6f4",
        },
        accent: {
          DEFAULT: "#f97316",
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#f97316",
          600: "#ea580c",
        },
      },

      fontFamily: {
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },

      boxShadow: {
        card:
          "0 1px 2px rgba(24,24,27,0.04), 0 12px 32px -12px rgba(24,24,27,0.12)",
      },

      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at 100% 0%, #fde9c8 0%, #fdf6ec 35%, #f7f6f4 60%, #f3eef9 100%)",
      },

      // ADD THIS
      keyframes: {
        "float-heart": {
          "0%": {
            transform: "translateY(0) scale(1)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(-80px) scale(1.4)",
            opacity: "0",
          },
        },
      },

      animation: {
        "float-heart": "float-heart 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};