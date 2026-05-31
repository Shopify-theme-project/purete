/**
 * ============================================================
 * Configuration Tailwind CSS — Thème Pureté
 * Palette et typographie issues de la charte graphique cliente.
 * ============================================================
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
  // Classes ajoutées dynamiquement par JS (jamais présentes dans le HTML
  // au moment du scan de purge), à conserver explicitement.
  safelist: [
    'est-visible',
    'est-en-cours',
    'est-ajoute',
    'est-active',
    'est-cache',
    'est-actif',
    'est-ouvert',
    'panier-ouvert',
  ],
  theme: {
    extend: {
      // ----- Palette de couleurs Pureté -----
      // Les mêmes valeurs sont déclarées dans config/settings_schema.json
      // pour permettre au client de les ajuster depuis l'éditeur de thème.
      colors: {
        creme: '#F2EADB',          // Fond principal
        ivoire: '#FAF5EB',         // Cartes, zones secondaires
        sauge: '#A8B89D',          // Top bar, sections accent
        'sauge-fonce': '#8A9D7E',  // Hover / états actifs
        'vert-profond': '#1F2D2A', // Boutons, titres, texte fort
        'gris-doux': '#6B6B6B',   // Texte secondaire
        or: '#D4A656',             // Étoiles d'avis, accents premium
      },

      // ----- Typographie -----
      // Polices auto-hébergées dans /assets/ (voir application.css @font-face)
      fontFamily: {
        titre: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        corps: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },

      // ----- Échelle typographique (clamp pour responsive fluide) -----
      fontSize: {
        logo: ['2rem', { lineHeight: '1', letterSpacing: '0.05em' }],
        'h1-hero': ['clamp(2.25rem, 4.5vw, 3.5rem)', { lineHeight: '1.1' }],
        'h2-section': ['1rem', { lineHeight: '1.4', letterSpacing: '0.2em' }],
        'h3-bloc': ['1.75rem', { lineHeight: '1.3' }],
        nav: ['0.9375rem', { lineHeight: '1.4' }],
        bouton: ['0.8125rem', { lineHeight: '1', letterSpacing: '0.15em' }],
        prix: ['0.875rem', { lineHeight: '1.4' }],
        'produit-nom': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.1em' }],
      },

      // ----- Conteneur centré -----
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
      },
    },
  },
  plugins: [],
};
