/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./pages/**/*.tsx",
    "./components/**/*.tsx",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': 'var(--primary, #007AFF)',
        'primary-hover': 'var(--primary-hover, #005ECC)',
        'dark-bg': '#121212',
        'dark-card': '#1E1E1E',
        'dark-border': '#2C2C2E',
        'dark-text': '#E5E5E7',
        'dark-text-secondary': '#8E8E93',
        'light-bg': '#F2F2F7',
        'light-card': '#FFFFFF',
        'light-border': '#D1D1D6',
        'light-text': '#1C1C1E',
        'light-text-secondary': '#3C3C43',
      },
      boxShadow: {
        'glow': '0 0 15px 5px var(--primary-glow, rgba(0, 122, 255, 0.2))',
      }
    },
  },
  plugins: [],
}