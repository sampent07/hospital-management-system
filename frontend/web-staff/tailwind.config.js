/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        medical: {
          green: '#10b981',
          blue: '#2563eb',
          amber: '#f59e0b',
          rose: '#f43f5e'
        }
      }
    },
  },
  plugins: [],
}
