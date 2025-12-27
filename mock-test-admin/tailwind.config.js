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
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'custom-light': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'custom-medium': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'card': '0 10px 25px -10px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        'xl': '12px',
      }
    },
  },
  plugins: [],
}

