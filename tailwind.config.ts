import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#112134",
        mist: "#edf4fb",
        surge: "#00a6a6",
        ember: "#f56f48",
        dune: "#f7efe7",
        line: "#d6e2ef",
      },
      boxShadow: {
        panel: "0 18px 50px -28px rgba(17, 33, 52, 0.35)",
      },
      borderRadius: {
        xl2: "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
