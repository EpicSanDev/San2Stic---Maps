import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
    <div className="max-w-2xl">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-text-primary">
        Bienvenue sur <span className="text-primary">San2Stic</span>
      </h1>
      <p className="text-lg sm:text-xl text-text-secondary mb-8">
        Explorez une carte sonore collaborative et écoutez notre radio indie-pop.
      </p>
      <nav className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Link
          to="/map"
          className="px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-150 text-lg w-full sm:w-auto"
        >
          Explorer la Carte
        </Link>
        <Link
          to="/radio"
          className="px-8 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all duration-150 text-lg w-full sm:w-auto"
        >
          Écouter la Radio
        </Link>
        {/* Optionnel: lien vers login/signup si pas déjà dans la navbar ou si on veut un CTA plus proéminent ici */}
        {/* <Link
          to="/login"
          className="px-6 py-3 border-2 border-accent text-accent font-semibold rounded-lg hover:bg-accent hover:text-text-primary transition-all duration-150 text-lg w-full sm:w-auto"
        >
          Se Connecter
        </Link> */}
      </nav>
    </div>
  </div>
);

export default Home;