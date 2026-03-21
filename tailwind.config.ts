import type { Config } from "tailwindcss"
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#020202",
          bg1: "#070707",
          bg2: "#0c0c0c",
          green: "#00ff41",
          cyan: "#00e5ff",
          magenta: "#ff00ff",
          yellow: "#ffd700",
          red: "#ff2d2d",
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        display: ["Orbitron", "monospace"],
      }
    }
  },
  plugins: []
}
export default config
