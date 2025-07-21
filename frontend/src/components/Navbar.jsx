import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon, 
  MapPinIcon,
  RadioIcon,
  CloudArrowUpIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { SpeakerWaveIcon as SpeakerWaveIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { GlassCard } from './ui/GlassCard';
import { cn } from '../utils/cn';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || 
           (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { 
      name: 'Map', 
      path: '/map', 
      icon: MapPinIcon,
      description: 'Explore field recordings'
    },
    { 
      name: 'Radio', 
      path: '/radio', 
      icon: RadioIcon,
      description: 'Live audio streams'
    },
    { 
      name: 'Upload', 
      path: '/upload', 
      icon: CloudArrowUpIcon,
      description: 'Share your recordings'
    },
  ];

  return (
    <header 
      className={cn(
        "fixed w-full z-50 transition-all duration-500",
        scrolled 
          ? "bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/20 shadow-lg" 
          : "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 via-electric-600 to-frequency-600 flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-lg">
                  <SpeakerWaveIconSolid className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-electric-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              </div>
              <div className="hidden sm:block">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 via-electric-600 to-frequency-600 bg-clip-text text-transparent">
                  San2Stic
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Decentralized Audio
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "group relative px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center space-x-2",
                      isActive(link.path)
                        ? "text-white bg-gradient-to-r from-primary-600 to-electric-600 shadow-lg"
                        : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/80"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                    {isActive(link.path) && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-600 to-electric-600 opacity-20 animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl transition-all duration-200"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-100 to-electric-100 dark:from-primary-900/50 dark:to-electric-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm border border-primary-200 dark:border-primary-700">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                  </div>
                  <span className="hidden lg:inline max-w-24 truncate">
                    {user.username || user.email?.split('@')[0]}
                  </span>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="p-2.5"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="gradient" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4">
            <GlassCard className="overflow-hidden">
              <div className="py-4 space-y-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-xl transition-colors mx-2",
                        isActive(link.path)
                          ? "text-white bg-gradient-to-r from-primary-600 to-electric-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <div>
                        <div>{link.name}</div>
                        <div className="text-xs opacity-70">{link.description}</div>
                      </div>
                    </Link>
                  );
                })}
                
                <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-2" />
                
                {/* Dark Mode Toggle Mobile */}
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors mx-2"
                >
                  {darkMode ? (
                    <SunIcon className="w-5 h-5" />
                  ) : (
                    <MoonIcon className="w-5 h-5" />
                  )}
                  <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors mx-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserCircleIcon className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors mx-2"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <div className="px-2 py-2 space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="ghost" className="w-full justify-start">
                        <UserCircleIcon className="w-5 h-5 mr-3" />
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="gradient" className="w-full justify-start">
                        <span className="mr-3">✨</span>
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
