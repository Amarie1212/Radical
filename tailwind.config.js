/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          darkest: '#070a12',
          DEFAULT: '#0B0F19',
          card: '#111726',
          surface: '#151d30',
          overlay: 'rgba(11, 15, 25, 0.85)',
        },
        brand: {
          orange: '#F97316',
          'orange-glow': '#FF6B00',
          'orange-dark': '#EA580C',
          'orange-light': '#FDBA74',
        },
        copper: {
          light: '#E6A875',
          DEFAULT: '#C87D4A',
          dark: '#844B24',
          deep: '#4E2B14',
          border: '#A86236',
          shine: '#FFD1A4',
        },
        tealplate: {
          light: '#255451',
          DEFAULT: '#173432',
          dark: '#0F2423',
          border: '#2A5C59',
          glow: '#2DD4BF',
        },
        cleared: {
          DEFAULT: '#22C55E',
          glow: '#4ADE80',
          dark: '#15803D',
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'Georgia', 'serif'],
        tactical: ['Rajdhani', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'neon-orange': '0 0 15px rgba(249, 115, 22, 0.4), 0 0 30px rgba(249, 115, 22, 0.2)',
        'plaque': '0 10px 40px -10px rgba(0, 0, 0, 0.8), 0 0 25px rgba(200, 125, 74, 0.25)',
        'copper-inset': 'inset 0 2px 4px rgba(255, 209, 164, 0.3), inset 0 -2px 6px rgba(0, 0, 0, 0.7)',
        'teal-inset': 'inset 0 2px 8px rgba(0, 0, 0, 0.6), inset 0 0 12px rgba(45, 212, 191, 0.08)',
      },
      backgroundImage: {
        'copper-gradient': 'linear-gradient(135deg, #dfa26e 0%, #c87d4a 35%, #844b24 70%, #5c3214 100%)',
        'copper-header': 'linear-gradient(180deg, #dfa26e 0%, #a86236 50%, #683618 100%)',
        'plaque-bg': 'radial-gradient(circle at 50% 30%, #1c423f 0%, #132b29 55%, #0d1e1c 100%)',
        'card-glow': 'radial-gradient(circle at 50% 0%, rgba(249, 115, 22, 0.15) 0%, rgba(17, 23, 38, 0) 70%)',
      }
    },
  },
  plugins: [],
}

