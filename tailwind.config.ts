import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx,css,scss}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx,css,scss}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx,css,scss}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: "var(--font-space-grotesk)",
      },
      colors: {
        base: "#fcfcfc",
      },
    },
  },
};
export default config;
