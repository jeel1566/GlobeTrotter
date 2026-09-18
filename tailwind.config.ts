import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#faf9f6',
          subtle: '#f4f2eb',
          muted: '#ebe8de',
        },
        obsidian: {
          950: '#04100e',
          900: '#071e1b',
          850: '#0b2b27',
          800: '#0f3833',
          700: '#144c45',
          600: '#1d685f',
        },
        brand: {
          50: '#f2fbf9',
          100: '#d9f5ef',
          200: '#b4ebdE',
          500: '#1aa898',
          600: '#13897c',
          700: '#0f6f64',
          800: '#0f544c',
          900: '#0c423c',
          teal: '#0d3834',
          accent: '#c99a5e',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Newsreader"', 'Georgia', 'serif'],
        handwriting: ['Caveat', 'cursive'],
      },
      boxShadow: {
        'hardware': '0 0 0 1px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04), 0 12px 24px -6px rgba(0,0,0,0.04)',
        'hardware-elevated': '0 0 0 1px rgba(0,0,0,0.08), 0 8px 16px -4px rgba(0,0,0,0.05), 0 24px 48px -12px rgba(0,0,0,0.08)',
        'inner-bezel': 'inset 0 1px 1px 0 rgba(255,255,255,0.85), inset 0 -1px 1px 0 rgba(0,0,0,0.03)',
        'glow-emerald': '0 0 40px -10px rgba(20, 184, 166, 0.35)',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.32, 0.72, 0, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
};
export default config;
