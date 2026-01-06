/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#e8eef9',
          100: '#d3dcf3',
          200: '#a7b9e7',
          300: '#7b95db',
          400: '#4f72cf',
          500: '#2a56c2',
          600: '#003399',
          700: '#002b80',
          800: '#002366',
          900: '#00194d',
        },
        slate: {
          850: '#1e293b',
        },
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
};
