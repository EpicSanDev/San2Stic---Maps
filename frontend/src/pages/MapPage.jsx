import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import { useRecordings } from '../hooks/useRecordings';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { cn } from '../utils/cn';

const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-white to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-secondary-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
    </div>
    <p className="text-lg text-neutral-700 dark:text-neutral-300 mt-6 font-medium">Chargement de la carte sonore...</p>
    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Récupération des enregistrements</p>
  </div>
);

const ErrorDisplay = ({ error, onRetry }) => (
  <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-white to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 p-4">
    <div className="max-w-md text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">Erreur de chargement</h2>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
        {error.message || 'Une erreur est survenue lors du chargement des données.'}
      </p>
      <Button onClick={onRetry} className="group">
        Réessayer
        <svg className="h-4 w-4 ml-2 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.357 2m-15.357-2H15" />
        </svg>
      </Button>
    </div>
  </div>
);

const MapControls = ({ recordings, onFilterChange, onViewModeChange, viewMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    tags: [],
    dateRange: 'all',
    license: 'all'
  });

  const recordingCount = recordings?.length || 0;
  const availableTags = [...new Set(recordings?.flatMap(r => r.tags || []) || [])];

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <Card className="absolute top-4 left-4 z-10 w-80 shadow-lg border-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Carte sonore</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {recordingCount} enregistrement{recordingCount !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            <svg 
              className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-180")} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4 border-t border-neutral-200 dark:border-neutral-700 pt-3">
            {/* View Mode Toggle */}
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                Mode d'affichage
              </label>
              <div className="flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1">
                <button
                  onClick={() => onViewModeChange?.('markers')}
                  className={cn(
                    "flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    viewMode === 'markers'
                      ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  )}
                >
                  Marqueurs
                </button>
                <button
                  onClick={() => onViewModeChange?.('heatmap')}
                  className={cn(
                    "flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    viewMode === 'heatmap'
                      ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  )}
                >
                  Heatmap
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Rechercher
              </Button>
              <Button size="sm" variant="outline">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MapPage = () => {
  const { recordings, isLoading, error, fetchRecordingsFromContract } = useRecordings();
  const [viewMode, setViewMode] = useState('markers');
  const [filteredRecordings, setFilteredRecordings] = useState([]);

  useEffect(() => {
    setFilteredRecordings(recordings || []);
  }, [recordings]);

  const handleFilterChange = (filters) => {
    // Implement filtering logic here
    let filtered = recordings || [];
    
    if (filters.tags.length > 0) {
      filtered = filtered.filter(recording => 
        recording.tags?.some(tag => filters.tags.includes(tag))
      );
    }
    
    setFilteredRecordings(filtered);
  };

  const handleRetry = () => {
    fetchRecordingsFromContract();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="h-screen flex flex-col relative">
      {/* Map Container */}
      <div className="flex-1 relative">
        <MapView 
          recordings={filteredRecordings} 
          onBoundsChange={fetchRecordingsFromContract}
          viewMode={viewMode}
        />
        
        {/* Map Controls Overlay */}
        <MapControls
          recordings={recordings}
          onFilterChange={handleFilterChange}
          onViewModeChange={setViewMode}
          viewMode={viewMode}
        />
        
        {/* Floating Action Button for Upload */}
        <div className="absolute bottom-6 right-6 z-10">
          <Button 
            size="lg" 
            className="h-14 w-14 rounded-full shadow-lg group"
            onClick={() => window.location.href = '/upload'}
          >
            <svg className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>
        
        {/* Recording Count Badge */}
        {recordings && recordings.length > 0 && (
          <div className="absolute bottom-6 left-4 z-10">
            <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {recordings.length} enregistrement{recordings.length !== 1 ? 's' : ''} chargé{recordings.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;