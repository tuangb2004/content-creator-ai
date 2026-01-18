/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Noto Sans', 'Be Vietnam Pro', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Noto Serif', 'Georgia', 'Times New Roman', 'Times', 'serif'],
      },
      wordBreak: {
        'normal': 'normal',
        'keep-all': 'keep-all',
      },
      wordSpacing: {
        'normal': 'normal',
      },
      letterSpacing: {
        'normal': 'normal',
      },
      overflowWrap: {
        'normal': 'normal',
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Editorial Design System Colors
        editorial: {
          cream: '#F5F2EB',
          'cream-dark': '#EBE7DE',
          charcoal: '#2C2A26',
          'charcoal-light': '#5D5A53',
          border: '#D6D1C7',
          muted: '#A8A29E',
          'bg-light': '#F9F8F6',
          'bg-dark': '#1C1B19',
          'border-dark': '#433E38',
        }
      }
    },
  },
  plugins: [],
}