import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const token = localStorage.getItem('token');

  // Style commun pour les liens
  const linkStyle = "px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white transition-all duration-300 ease-in-out";
  const activeLinkStyle = "bg-secondary text-white"; // Exemple de style actif, à implémenter avec NavLink si besoin

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <Link to="/" className="flex-shrink-0 flex items-center text-xl font-bold hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white transition-opacity duration-300 ease-in-out">
              San2Stic
            </Link>
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4">
                <Link to="/map" className={linkStyle}>Map</Link>
                <Link to="/radio" className={linkStyle}>Radio</Link>
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {token ? (
              <>
                <Link to="/profile" className={linkStyle}>Profile</Link>
                <button
                  onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                  className={`${linkStyle} ml-3 bg-accent text-text-primary hover:bg-accent/90 focus:bg-accent/70`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={linkStyle}>Login</Link>
                <Link to="/signup" className={`${linkStyle} ml-3 bg-secondary hover:bg-secondary/90 focus:bg-secondary/70`}>Signup</Link>
              </>
            )}
          </div>
          {/* Mobile menu button (placeholder, à implémenter si besoin d'un menu hamburger) */}
          {/* <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed. Heroicon name: outline/menu, Menu open: "hidden", Menu closed: "block" */}
              {/* <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg> */}
              {/* Icon when menu is open. Heroicon name: outline/x, Menu open: "block", Menu closed: "hidden" */}
              {/* <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg> */}
            {/* </button>
          </div> */}
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state (placeholder) */}
      {/* <div className="sm:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link to="/map" className={`${linkStyle} block`}>Map</Link>
          <Link to="/radio" className={`${linkStyle} block`}>Radio</Link>
          {token ? (
            <>
              <Link to="/profile" className={`${linkStyle} block`}>Profile</Link>
              <button
                onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                className={`${linkStyle} block w-full text-left bg-accent text-text-primary hover:bg-accent/90`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`${linkStyle} block`}>Login</Link>
              <Link to="/signup" className={`${linkStyle} block bg-secondary hover:bg-secondary/90`}>Signup</Link>
            </>
          )}
        </div>
      </div> */}
    </nav>
  );
};

export default Navbar;