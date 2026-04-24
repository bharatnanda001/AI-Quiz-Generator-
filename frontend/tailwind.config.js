/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f7f9fb',
        primary: {
          DEFAULT: '#1E40AF', // Scholar Blue
          dark: '#00288E',
          fixed: '#dde1ff',
        },
        surface: {
          lowest: '#ffffff',
          low: '#f2f4f6',
          container: '#eceef0',
          dim: '#d8dadc',
        },
        txt: {
          DEFAULT: '#191c1e',
          variant: '#444653',
        }
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
