/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: { 
        brand: { 400: '#34d399', 500: '#10B981', 600: '#059669' }, 
        studio: { 900: '#0f172a', 950: '#020617' } 
      },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'] }
    },
  },
  plugins: [],
}
