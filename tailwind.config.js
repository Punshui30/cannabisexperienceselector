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

    // Live Consultant Safelist (Force Emission)
    "bg-[#0a0a0a]/90",
    "backdrop-blur-2xl",
    "shadow-[0_0_10px_#00FFD1]",
    "bg-gradient-to-br",
    "from-white/10",
    "to-white/5",
    "shadow-[0_4px_20px_rgba(0,255,209,0.2)]",
    "bg-[#00FFD1]",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

