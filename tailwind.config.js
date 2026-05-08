/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at top, rgba(20, 184, 166, 0.16), transparent 40%), radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.12), transparent 30%)',
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 23, 42, 0.35)',
      },
      maxWidth: {
        shell: '1180px',
      },
    },
  },
  plugins: [],
};

