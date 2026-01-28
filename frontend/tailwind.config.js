/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Manrope', 'Roboto', 'Noto Sans', 'Be Vietnam Pro', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Instrument Serif', 'Noto Serif', 'Georgia', 'Times New Roman', 'Times', 'serif'],
        playfair: ['Playfair Display', 'serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: "#0d9488", // teal-600
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        "primary-light": "#14b8a6",
        "background-light": "#F9FAFB",
        "background-dark": "#0F172A",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1E293B",
        "accent-teal": "#99f6e4",

        // Pricing Page Specific Colors
        "pricing-primary": "#0d9488",
        "pricing-primary-light": "#2dd4bf",
        "pricing-primary-dark": "#0f766e",
        "pricing-secondary": "#ccfbf1",
        "pricing-background-light": "#F0FDFA",
        "pricing-background-dark": "#111827",
        "pricing-surface-light": "#FFFFFF",
        "pricing-surface-dark": "#1F2937",
        "pricing-text-light": "#134e4a",
        "pricing-text-dark": "#F0FDFA",
        "pricing-teal-light": "#ccfbf1",
        "pricing-teal-dark": "#134e4a",

        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
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
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        contentFadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}