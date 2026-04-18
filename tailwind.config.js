/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
  ],
  // Use 'class' strategy so Tailwind dark: utilities respect our data-theme attribute
  darkMode: ['attribute', 'data-theme'],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#FF6A00',
          50:  '#fff7ed',
          100: '#ffedd5',
          500: '#FF6A00',
          600: '#ea580c',
        },
      },
      fontFamily: {
        sans:    ['Inter',   'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      backgroundColor: {
        surface:  'var(--s1)',
        surface2: 'var(--s2)',
        surface3: 'var(--s3)',
      },
      textColor: {
        primary:   'var(--t1)',
        secondary: 'var(--t2)',
        muted:     'var(--t3)',
      },
      borderColor: {
        theme: 'var(--border)',
      },
    },
  },
  plugins: [],
};
