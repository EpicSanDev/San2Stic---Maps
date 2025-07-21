import React, { useState } from 'react';
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/cn';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, setLightTheme, setDarkTheme, setSystemTheme, isDark } = useTheme();
  const [showOptions, setShowOptions] = useState(false);

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <MoonIcon className="w-5 h-5" />;
      case 'light':
        return <SunIcon className="w-5 h-5" />;
      default:
        return <ComputerDesktopIcon className="w-5 h-5" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'dark':
        return 'Dark';
      case 'light':
        return 'Light';
      default:
        return 'System';
    }
  };

  const themeOptions = [
    {
      id: 'light',
      label: 'Light',
      icon: <SunIcon className="w-4 h-4" />,
      action: setLightTheme
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: <MoonIcon className="w-4 h-4" />,
      action: setDarkTheme
    },
    {
      id: 'system',
      label: 'System',
      icon: <ComputerDesktopIcon className="w-4 h-4" />,
      action: setSystemTheme
    }
  ];

  return (
    <div className={cn('relative', className)}>
      {/* Simple Toggle Button */}
      <button
        onClick={toggleTheme}
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
          'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
          'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
        )}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {getThemeIcon()}
      </button>

      {/* Dropdown Toggle (for more complex theme selection) */}
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={cn(
            'hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200',
            'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
            'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
          )}
        >
          {getThemeIcon()}
          <span className="text-sm font-medium">{getThemeLabel()}</span>
          <ChevronDownIcon 
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              showOptions ? 'rotate-180' : ''
            )} 
          />
        </button>

        {/* Dropdown Menu */}
        {showOptions && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowOptions(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-48 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="py-2">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      option.action();
                      setShowOptions(false);
                    }}
                    className={cn(
                      'w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors',
                      'hover:bg-gray-100 dark:hover:bg-gray-700',
                      theme === option.id 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                        : 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {option.icon}
                    <span className="text-sm font-medium">{option.label}</span>
                    {theme === option.id && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ThemeToggle;