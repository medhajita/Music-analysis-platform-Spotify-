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
          light: '#1DB954', // Spotify Green
          dark: '#1ed760',
        },
        background: {
          light: '#ffffff',
          dark: '#121212',
        },
        sidebar: {
          light: '#f8f9fa',
          dark: '#000000',
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
