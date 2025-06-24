// tailwind.config.js
const nesting = require('tailwindcss/nesting');

module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/@ionic/angular/**/*.{js,ts}"
  ],
  theme: {
    extend: {},
  },
  plugins: [nesting(require('postcss-nesting'))],
}
