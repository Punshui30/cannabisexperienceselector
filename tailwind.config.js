/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // borders
    "border-emerald-400",
    "border-teal-400",
    "border-violet-400",
    "border-cyan-400",

    // text
    "text-emerald-300",
    "text-teal-300",
    "text-violet-300",
    "text-cyan-300",

    // backgrounds
    "bg-emerald-500/10",
    "bg-teal-500/10",
    "bg-violet-500/10",
    "bg-cyan-500/10",

    // glows / rings
    "ring-emerald-400/30",
    "ring-teal-400/30",
    "ring-violet-400/30",
    "ring-cyan-400/30",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

