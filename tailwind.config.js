/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary - Earthy green tones (avoiding purple/indigo)
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Emotional state colors
        calm: {
          DEFAULT: '#60a5fa',
          light: '#93c5fd',
          dark: '#3b82f6',
        },
        anxious: {
          DEFAULT: '#fbbf24',
          light: '#fcd34d',
          dark: '#f59e0b',
        },
        grateful: {
          DEFAULT: '#c084fc',
          light: '#d8b4fe',
          dark: '#a855f7',
        },
        struggling: {
          DEFAULT: '#fb7185',
          light: '#fda4af',
          dark: '#f43f5e',
        },
        peace: {
          DEFAULT: '#5eead4',
          light: '#99f6e4',
          dark: '#2dd4bf',
        },
      },
      fontFamily: {
        // Using system fonts for now - can add custom fonts later
        heading: ['System'],
        body: ['System'],
        prayer: ['System'],
      },
      animation: {
        'breathing': 'breathe 4s ease-in-out infinite',
        'pulse-gentle': 'pulse-gentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
