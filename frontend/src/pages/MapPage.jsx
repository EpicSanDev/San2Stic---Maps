import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon, 
  ChevronDownIcon, 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon, 
  PlusIcon,
  ChartBarIcon,
  BoltIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import MapView from '../components/MapView';
import RecordingDetailsModal from '../components/RecordingDetailsModal';
import BatchOperationsPanel from '../components/BatchOperationsPanel';
import UserDashboard from '../components/UserDashboard';
import SystemStatsDashboard from '../components/SystemStatsDashboard';
import { useRecordings } from '../hooks/useRecordings';
import { useWeb3 } from '../hooks/useWeb3';
import { web3Service } from '../utils/web3';
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
        <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">Erreur de chargement</h2>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
        {error.message || 'Une erreur est survenue lors du chargement des données.'}
      </p>
      <Button onClick={onRetry} className="group">
        Réessayer
        <ArrowPathIcon className="h-4 w-4 ml-2 group-hover:rotate-180 transition-transform duration-300" />
      </Button>
    </div>
  </div>
);

const MapControls = ({ recordings, onViewModeChange, viewMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const recordingCount = recordings?.length || 0;

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
            <ChevronDownIcon className={cn("h-5 w-5 transition-transform duration-200", isExpanded && "rotate-180")} />
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
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
              <Button size="sm" variant="outline">
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MapPage = () => {
  const navigate = useNavigate();
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
        {/* Enhanced Map View */}
        <MapView 
          recordings={filteredRecordings} 
          onBoundsChange={fetchRecordingsFromContract}
          onRecordingClick={setSelectedRecording}
          onUserClick={openUserDashboard}
          viewMode={viewMode}
        />
        
        {/* Map Controls Overlay */}
        <MapControls
          recordings={recordings}
          onFilterChange={handleFilterChange}
          onViewModeChange={setViewMode}
          viewMode={viewMode}
        />
        
  const applyFilters = () => {
    let filtered = recordings || [];
    
    if (filters.tags.length > 0) {
      filtered = filtered.filter(recording => 
        recording.tags?.some(tag => filters.tags.includes(tag))
      );
    }
    
    setFilteredRecordings(filtered);
  };
        
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

      {/* Modals */}
      {selectedRecording && (
        <RecordingDetailsModal
          recording={selectedRecording}
          isOpen={!!selectedRecording}
          onClose={() => setSelectedRecording(null)}
          onVote={handleVoteOnRecording}
          onRate={handleRateRecording}
        />
      )}

      {showBatchPanel && (
        <BatchOperationsPanel
          recordings={filteredRecordings}
          onClose={() => setShowBatchPanel(false)}
          onOperationComplete={fetchRecordingsFromContract}
        />
      )}

      {showUserDashboard && (
        <UserDashboard
          userAddress={selectedUserAddress}
          onClose={() => {
            setShowUserDashboard(false);
            setSelectedUserAddress(null);
          }}
        />
      )}

      {showSystemStats && (
        <SystemStatsDashboard
          isOpen={showSystemStats}
          onClose={() => setShowSystemStats(false)}
        />
      )}
    </div>
  );
};

export default MapPage;