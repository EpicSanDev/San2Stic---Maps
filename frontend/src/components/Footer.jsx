import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white/50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-500 dark:text-gray-400">&copy; {new Date().getFullYear()} San2Stic. Tous droits réservés.</p>
          <div className="flex items-center space-x-6">
            <Link to="/map" className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
              Carte
            </Link>
            <Link to="/radio" className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
              Radio
            </Link>
            <Link to="/advanced" className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
              Upload Avancé
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
