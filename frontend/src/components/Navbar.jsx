import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = "px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white transition-all duration-300 ease-in-out";
  const activeLinkStyle = "bg-blue-700 text-white";

  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <Link to="/" className="flex-shrink-0 flex items-center text-xl font-bold hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white transition-opacity duration-300 ease-in-out">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">S2S</span>
              </div>
              San2Stic
            </Link>
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4">
                <Link 
                  to="/map" 
                  className={`${linkStyle} ${isActive('/map') ? activeLinkStyle : ''}`}
                >
                  Map
                </Link>
                <Link 
                  to="/radio" 
                  className={`${linkStyle} ${isActive('/radio') ? activeLinkStyle : ''}`}
                >
                  Radio
                </Link>
                <Link 
                  to="/upload" 
                  className={`${linkStyle} ${isActive('/upload') ? activeLinkStyle : ''}`}
                >
                  Upload
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className={`${linkStyle} ${isActive('/profile') ? activeLinkStyle : ''}`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className={`${linkStyle} ml-3 bg-red-600 hover:bg-red-700 focus:bg-red-700`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`${linkStyle} ${isActive('/login') ? activeLinkStyle : ''}`}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className={`${linkStyle} ml-3 bg-green-600 hover:bg-green-700 focus:bg-green-700 ${isActive('/signup') ? 'bg-green-700' : ''}`}
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
