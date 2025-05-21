/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',    // Corail Vif
        secondary: '#4ECDC4',  // Turquoise Frais
        accent: '#F7B731',     // Jaune Soleil
        neutral: '#F0F0F0',    // Gris Clair Doux
        background: '#FFFFFF', // Blanc Pur
        'text-primary': '#2D3748', // Gris Foncé Charbon
        'text-secondary': '#718096', // Gris Moyen
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};