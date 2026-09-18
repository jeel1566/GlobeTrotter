import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          subtle: '#EFF6FF',
          container: '#2563EB',
        },
        secondary: {
          DEFAULT: '#14B8A6',
          hover: '#0D9488',
          subtle: '#F0FDFA',
        },
        accent: {
          DEFAULT: '#F97316',
          hover: '#EA580C',
          subtle: '#FFF7ED',
        },
        background: '#FAFAFA',
        surface: '#FFFFFF',
        text: '#111827',
        muted: '#6B7280',
        brand: {
          teal: '#0F766E',
          tealDark: '#0D3D38',
          tealLight: '#E6F3F1',
          activeBg: '#D9E9E6',
          accent: '#F97316',
          primary: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'Inter', 'sans-serif'],
        heading: ['var(--font-heading)', 'Plus Jakarta Sans', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      keyframes: {
        spotlight: {
          '0%': { opacity: '0', transform: 'translate(-72%, -62%) scale(0.5)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -40%) scale(1)' },
        },
        'shimmer-slide': {
          to: {
            transform: 'translate(calc(100cqw - 100%), 0)',
          },
        },
        'spin-around': {
          '0%': { transform: 'translateZ(0) rotate(0)' },
          '15%, 35%': { transform: 'translateZ(0) rotate(90deg)' },
          '65%, 85%': { transform: 'translateZ(0) rotate(270deg)' },
          '100%': { transform: 'translateZ(0) rotate(360deg)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        spotlight: 'spotlight 2s ease .75s 1 forwards',
        'shimmer-slide': 'shimmer-slide var(--speed) ease-in-out infinite alternate',
        'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
