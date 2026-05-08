/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#ebf1ff',
          100: '#d6e4ff',
          200: '#adc8ff',
          300: '#85aaff',
          400: '#5b8fff',
          500: '#3182f6',
          600: '#1b64da',
          700: '#1250b8',
          800: '#0c3d96',
          900: '#082b74',
        },
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at top, rgba(49, 130, 246, 0.12), transparent 40%), radial-gradient(circle at bottom right, rgba(91, 143, 255, 0.08), transparent 30%)',
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

