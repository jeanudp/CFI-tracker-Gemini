module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg-primary': '#0a1628',
        'dark-bg-secondary': '#0f1f35',
        'dark-bg-tertiary': '#1a2f4a',
        'dark-border': '#1e3a5c',
      }
    },
  },
  plugins: [],
  safelist: [
    { pattern: /dark:.*/ },
    'dark',
  ],
}
