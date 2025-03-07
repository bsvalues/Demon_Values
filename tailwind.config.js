/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'demon-black': '#0D0D0D',
        'demon-dark': '#1A1A1A',
        'demon-red': {
          DEFAULT: '#EF4444',
          dark: '#991B1B',
          light: '#FEE2E2'
        },
        'demon-orange': {
          DEFAULT: '#F97316',
          dark: '#9A3412',
          light: '#FFEDD5'
        }
      },
      boxShadow: {
        'demon': '0 0 15px rgba(239, 68, 68, 0.3)',
        'demon-hover': '0 0 25px rgba(239, 68, 68, 0.5)',
        'demon-active': '0 0 35px rgba(239, 68, 68, 0.7)'
      },
      animation: {
        'demon-pulse': 'demon-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'demon-glow': 'demon-glow 1.5s ease-in-out infinite alternate'
      },
      keyframes: {
        'demon-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 }
        },
        'demon-glow': {
          '0%': {
            'box-shadow': '0 0 5px rgba(239, 68, 68, 0.5)',
            'transform': 'scale(1)'
          },
          '100%': {
            'box-shadow': '0 0 20px rgba(239, 68, 68, 0.8)',
            'transform': 'scale(1.02)'
          }
        }
      }
    },
  },
  plugins: [],
};