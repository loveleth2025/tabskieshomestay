import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#F7F2E9",
        sandDark: "#EDE7DA",
        surface: "#FFFFFF",
        ink: "#20302C",
        teal: {
          DEFAULT: "#1F6F6B",
          dark: "#16514E",
          soft: "rgba(31,111,107,0.1)",
        },
        clay: {
          DEFAULT: "#A5623A",
          soft: "#F3E6DC",
        },
        ochre: {
          DEFAULT: "#B5762E",
          soft: "#FCEFDF",
        },
        line: "rgba(32,48,44,0.1)",
      },
      fontFamily: {
        display: ['"Newsreader"', "Georgia", "serif"],
        body: ['"Work Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
