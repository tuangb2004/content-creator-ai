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
          DEFAULT: "#000000", // black
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        "primary-light": "#374151",
        "background-light": "#F9FAFB",
        "background-dark": "#0F172A",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1E293B",
        "accent-teal": "#e5e7eb",

        // Pricing Page Specific Colors
        "pricing-primary": "#000000",
        "pricing-primary-light": "#374151",
        "pricing-primary-dark": "#000000",
        "pricing-secondary": "#f3f4f6",
        "pricing-background-light": "#FFFFFF",
        "pricing-background-dark": "#111827",
        "pricing-surface-light": "#FFFFFF",
        "pricing-surface-dark": "#1F2937",
        "pricing-text-light": "#000000",
        "pricing-text-dark": "#F9FAFB",
        "pricing-teal-light": "#f3f4f6",
        "pricing-teal-dark": "#1f2937",

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