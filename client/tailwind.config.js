/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF9F6', // Alabaster/Off-white
        surface: '#FFFFFF',
        primary: '#1A1A1A', // Charcoal
        secondary: '#6B6B6B', // Muted Gray
        accent: '#8B5A2B', // Cognac / Leather
        border: '#E5E5E5',
        error: '#991B1B',
        success: '#166534',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
      },
    },
  },
  plugins: [],
}
