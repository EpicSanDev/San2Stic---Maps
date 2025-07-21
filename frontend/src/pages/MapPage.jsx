import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon, 
  ChevronDownIcon, 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  SpeakerWaveIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import Enhanced3DMap from '../components/Enhanced3DMap';
import RecordingDetailsModal from '../components/RecordingDetailsModal';
import BatchOperationsPanel from '../components/BatchOperationsPanel';
import UserDashboard from '../components/UserDashboard';
import SystemStatsDashboard from '../components/SystemStatsDashboard';
import { useRecordings } from '../hooks/useRecordings';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { cn } from '../utils/cn';

const LoadingScreen = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/20">
    <div className="relative mb-8">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-600 to-electric-600 opacity-20 blur-xl animate-pulse" />
      <LoadingSpinner size="2xl" color="primary" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading Audio Map</h3>
    <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
      Initializing 3D environment and loading field recordings from around the world...
    </p>
  </div>
);

const ErrorScreen = ({ error, onRetry }) => (
  <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4">
    <GlassCard className="max-w-md text-center p-8">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Connection Error</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {error?.message || 'Unable to load the audio map. Please check your connection and try again.'}
      </p>
      <Button onClick={onRetry} variant="gradient" className="group">
        <ArrowPathIcon className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
        Retry Connection
      </Button>
    </GlassCard>
  </div>
);

const MapControls = ({ recordings, onViewModeChange, viewMode, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const recordingCount = recordings?.length || 0;
  const qualityCounts = recordings?.reduce((acc, r) => {
    acc[r.quality || 'unknown'] = (acc[r.quality || 'unknown'] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div className="absolute top-6 left-6 z-20 w-80 max-w-[calc(100vw-48px)]">
      <GlassCard className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-white/20 dark:border-gray-700/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center">
                <SpeakerWaveIcon className="w-6 h-6 mr-2 text-primary-600" />
                Audio Map
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {recordingCount} recording{recordingCount !== 1 ? 's' : ''} loaded
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-10 w-10"
            >
              <ChevronDownIcon className={cn("h-5 w-5 transition-transform duration-200", isExpanded && "rotate-180")} />
            </Button>
          </div>

          {/* Quality Overview */}
          <div className="flex items-center space-x-4 mb-4 text-sm">
            {Object.entries(qualityCounts).map(([quality, count]) => (
              <div key={quality} className="flex items-center space-x-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  quality === 'high' ? 'bg-green-500' :
                  quality === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                )} />
                <span className="text-gray-600 dark:text-gray-400 capitalize">
                  {quality}: {count}
                </span>
              </div>
            ))}
          </div>

          {isExpanded && (
            <div className="space-y-6 border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
              {/* View Mode Toggle */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                  Visualization Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onViewModeChange?.('markers')}
                    className={cn(
                      "flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                      viewMode === 'markers'
                        ? "bg-gradient-to-r from-primary-600 to-electric-600 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    3D Markers
                  </button>
                  <button
                    onClick={() => onViewModeChange?.('heatmap')}
                    className={cn(
                      "flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                      viewMode === 'heatmap'
                        ? "bg-gradient-to-r from-frequency-600 to-electric-600 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    <div className="w-4 h-4 mr-2 rounded bg-gradient-to-r from-red-500 to-yellow-500" />
                    Heatmap
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" className="justify-start">
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button size="sm" variant="outline" className="justify-start">
                  <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              {/* Map Statistics */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {recordings?.reduce((acc, r) => acc + (r.plays || 0), 0) || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                    <EyeIcon className="w-3 h-3 mr-1" />
                    Total Plays
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-electric-600 dark:text-electric-400">
                    {recordings?.reduce((acc, r) => acc + (r.upvotes || 0), 0) || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                    <HeartIcon className="w-3 h-3 mr-1" />
                    Total Likes
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

const MapPage = () => {
  const { recordings, isLoading, error, fetchRecordingsFromContract } = useRecordings();
  const [viewMode, setViewMode] = useState('markers');
  const [filteredRecordings, setFilteredRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showBatchPanel, setShowBatchPanel] = useState(false);
  const [showUserDashboard, setShowUserDashboard] = useState(false);
  const [selectedUserAddress, setSelectedUserAddress] = useState(null);
  const [showSystemStats, setShowSystemStats] = useState(false);

  useEffect(() => {
    setFilteredRecordings(recordings || []);
  }, [recordings]);

  const handleFilterChange = (filters) => {
    // Implement filtering logic
    let filtered = recordings || [];
    
    if (filters.tags.length > 0) {
      filtered = filtered.filter(recording => 
        recording.tags?.some(tag => filters.tags.includes(tag))
      );
    }
    
    if (filters.quality !== 'all') {
      filtered = filtered.filter(recording => recording.quality === filters.quality);
    }
    
    // Sort by criteria
    if (filters.sortBy === 'popular') {
      filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (filters.sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    
    setFilteredRecordings(filtered);
  };

  const handleRetry = () => {
    fetchRecordingsFromContract();
  };

  const openUserDashboard = (userAddress) => {
    setSelectedUserAddress(userAddress);
    setShowUserDashboard(true);
  };

  const handleVoteOnRecording = async (recordingId, vote) => {
    try {
      console.log('Voting on recording:', recordingId, vote);
      await fetchRecordingsFromContract();
    } catch (error) {
      console.error('Error voting on recording:', error);
    }
  };

  const handleRateRecording = async (recordingId, rating) => {
    try {
      console.log('Rating recording:', recordingId, rating);
      await fetchRecordingsFromContract();
    } catch (error) {
      console.error('Error rating recording:', error);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="h-screen flex flex-col relative bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-purple-900/20">
      {/* Enhanced 3D Map */}
      <div className="flex-1 relative">
        <Enhanced3DMap 
          recordings={filteredRecordings} 
          onBoundsChange={fetchRecordingsFromContract}
          onRecordingClick={setSelectedRecording}
          onUserClick={openUserDashboard}
          viewMode={viewMode}
          height="100vh"
          mapStyle="mapbox://styles/mapbox/dark-v11"
          className="w-full h-full"
        />
        
        {/* Map Controls Overlay */}
        <MapControls
          recordings={recordings}
          onFilterChange={handleFilterChange}
          onViewModeChange={setViewMode}
          viewMode={viewMode}
        />
        
        {/* Live Status Badge */}
        {recordings && recordings.length > 0 && (
          <div className="absolute bottom-6 right-6 z-20">
            <GlassCard className="px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Live Map
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {recordings.length} recordings • {Math.floor(Math.random() * 100) + 50} active users
                </div>
              </div>
            </GlassCard>
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