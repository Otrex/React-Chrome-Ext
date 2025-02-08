import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  plugins: [require("daisyui")],
};

export default config;
