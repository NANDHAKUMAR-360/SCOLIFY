/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a4bcfd',
          400: '#7c98fa',
          500: '#536bf6',
          600: '#3c4cf0',
          700: '#313ad7',
          800: '#2a31ae',
          900: '#272d8a',
          950: '#181a54',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#f43f5e',
          600: '#e11d48',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card-soft': '0 4px 20px -2px rgba(50, 60, 110, 0.06), 0 2px 6px -1px rgba(50, 60, 110, 0.03)',
        'card-hover': '0 12px 30px -4px rgba(50, 60, 110, 0.12), 0 4px 12px -2px rgba(50, 60, 110, 0.04)',
        'floating': '0 20px 40px -8px rgba(39, 45, 138, 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
