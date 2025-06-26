/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,ts}',
    './node_modules/@ionic/angular/**/*.{js,mjs,ts}'
  ],
  theme: {
    extend: {
      colors: {
        // Alignement avec les couleurs Ionic par défaut
        primary: 'var(--ion-color-primary)',
        secondary: 'var(--ion-color-secondary)',
        tertiary: 'var(--ion-color-tertiary)',
        success: 'var(--ion-color-success)',
        warning: 'var(--ion-color-warning)',
        danger: 'var(--ion-color-danger)',
        light: 'var(--ion-color-light)',
        medium: 'var(--ion-color-medium)',
        dark: 'var(--ion-color-dark)'
      }
    },
  },
  plugins: [
    // Plugin pour gérer les pseudo-classes Ionic
    function ({ addVariant }) {
      addVariant('ion-page', 'body &');
      addVariant('host', '&:host');
      addVariant('host-context', '&:host-context');
    }
  ],
  corePlugins: {
    // Désactive les fonctionnalités conflictuelles
    float: false,  // Ionic gère déjà le float RTL
    textAlign: false // Ionic gère déjà l'alignement RTL
  }
}