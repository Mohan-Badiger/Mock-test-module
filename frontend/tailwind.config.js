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
          blue: '#2563eb',
          yellow: '#fbbf24',
        }
      },
      fontFamily: {
        display: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        card: '0 10px 25px -10px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        xl: '1rem',
      }
    },
  },
  plugins: [],
}

