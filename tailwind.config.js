/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}','./components/**/*.{js,jsx}','./app/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        black: '#0B0B0B',
        s1: '#111111', s2: '#161616', s3: '#1E1E1E', s4: '#252525',
        orange: { DEFAULT: '#FF6A00', dim: 'rgba(255,106,0,0.12)', glow: 'rgba(255,106,0,0.06)' },
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif'],
        display: ['Poppins','sans-serif'],
      },
    },
  },
  plugins: [],
}
