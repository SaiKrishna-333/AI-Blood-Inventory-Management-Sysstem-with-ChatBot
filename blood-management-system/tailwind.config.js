/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          400: '#ff3333',
          500: '#ff0000',
          600: '#cc0000',
          700: '#990000',
        },
        secondary: {
          400: '#4d4d4d',
          500: '#333333',
          600: '#1a1a1a',
          700: '#0d0d0d',
          800: '#000000',
          900: '#000000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
