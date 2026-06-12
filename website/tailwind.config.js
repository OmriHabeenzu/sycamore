/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f2f8f4',
          100: '#e0f0e5',
          200: '#c2e1cc',
          300: '#95c9a8',
          400: '#60aa7d',
          500: '#3d8f5f',
          600: '#2d7249',
          700: '#265c3c',
          800: '#1f4930',
          900: '#193c27',
          950: '#0d2317',
        },
        earth: {
          50:  '#fdf8f0',
          100: '#faefd9',
          200: '#f4dba8',
          300: '#edc26e',
          400: '#e4a03c',
          500: '#d4841f',
          600: '#b86717',
          700: '#984e16',
          800: '#7c3f18',
          900: '#663516',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
