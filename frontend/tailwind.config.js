/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#fbf7ef',
          100: '#f3eadc',
          200: '#e6d8c4',
          300: '#d7c2a9',
          400: '#a98f73',
          500: '#80664f',
          600: '#694f3c',
          700: '#523b2d',
          800: '#38271f',
          900: '#251a15',
          950: '#17100d',
        },
        emerald: {
          50: '#fff8e6',
          100: '#f8edc8',
          200: '#ead59a',
          700: '#8a5a16',
          800: '#6f4511',
        },
        brand: {
          50: '#fbf3ea',
          100: '#f1dfca',
          500: '#9b5b3e',
          600: '#7b432d',
          700: '#5f3124',
        },
        ink: '#211915',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.07)',
      },
    },
  },
  plugins: [],
};
