/**
 * Configuration Tailwind CSS pour le thème Pureté.
 * Tailwind scanne tous les fichiers .liquid pour générer les classes
 * utilisées dans le thème.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layout/**/*.liquid',
    './sections/**/*.liquid',
    './snippets/**/*.liquid',
    './templates/**/*.liquid',
    './blocks/**/*.liquid',
  ],
  theme: {
    extend: {
      // Couleurs synchronisées avec settings_schema.json
      colors: {
        primaire: '#1f2d2a',
        secondaire: '#f7f3ee',
        accent: '#c89f7a',
      },
      fontFamily: {
        titre: ['"Cormorant Garamond"', 'serif'],
        corps: ['Assistant', 'sans-serif'],
      },
      container: {
        center: true,
        padding: '1rem',
      },
    },
  },
  plugins: [],
};
