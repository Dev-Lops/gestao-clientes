import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      theme: {
        extend: {
          colors: {
            brand: {
              50: "#f9f7ff",
              100: "#f1edfe",
              200: "#e2d7fd",
              300: "#c8b3fb",
              400: "#a888f7",
              500: "#8a5af2",
              600: "#743de3",
              700: "#6131c0",
              800: "#4f289b",
              900: "#3e2179",
            },
            neutral: {
              50: "#f8f9fa",
              100: "#f1f3f5",
              200: "#e9ecef",
              300: "#dee2e6",
              400: "#adb5bd",
              500: "#868e96",
              600: "#495057",
              700: "#343a40",
              800: "#212529",
              900: "#16191d",
            },
          },
          fontFamily: {
            sans: ["Inter", "system-ui", "sans-serif"],
            display: ["Poppins", "sans-serif"],
          },
        },
      },
    },
  },
  plugins: [forms(), typography(), animate],
};
