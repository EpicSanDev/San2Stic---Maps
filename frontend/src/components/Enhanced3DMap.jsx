import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Map, { 
  Marker, 
  Popup, 
  NavigationControl, 
  FullscreenControl, 
  ScaleControl, 
  GeolocateControl,
  Layer,
  Source
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon,
  StarIcon,
  EyeIcon,
  HeartIcon,
  MapPinIcon,
  Cog6ToothIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { 
  SpeakerWaveIcon as SpeakerWaveIconSolid,
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid';
import { cn } from '../utils/cn';
import { GlassCard } from './ui/GlassCard';
import { AudioPlayer } from './ui/AudioPlayer';
import { LoadingSpinner } from './ui/LoadingSpinner';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

// Enhanced 3D Audio Marker Component
const Audio3DMarker = ({ 
  recording, 
  isSelected, 
  isPlaying, 
  onSelect, 
  onPlay, 
  viewMode = 'markers',
  zoom = 10
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Simulate audio level animation
  useEffect(() => {
    if (!isPlaying) {
      setAudioLevel(0);
      return;
    }

    const interval = setInterval(() => {
      setAudioLevel(Math.random() * 100);
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const markerSize = useMemo(() => {
    const baseSize = Math.max(20, Math.min(60, zoom * 2));
    const qualityMultiplier = recording.quality === 'high' ? 1.2 : recording.quality === 'medium' ? 1.1 : 1;
    const popularityMultiplier = 1 + (recording.upvotes || 0) * 0.02;
    
    return baseSize * qualityMultiplier * popularityMultiplier;
  }, [zoom, recording.quality, recording.upvotes]);

  const getAudioTypeColor = (tags) => {
    if (!tags || !Array.isArray(tags)) return 'primary';
    
    if (tags.some(tag => ['nature', 'field', 'outdoor', 'ambient'].includes(tag.toLowerCase()))) {
      return 'acoustic';
    }
    if (tags.some(tag => ['electronic', 'synth', 'digital', 'effect'].includes(tag.toLowerCase()))) {
      return 'electric';
    }
    if (tags.some(tag => ['voice', 'speech', 'vocal', 'human'].includes(tag.toLowerCase()))) {
      return 'frequency';
    }
    return 'primary';
  };

  const audioTypeColor = getAudioTypeColor(recording.tags);
  
  const colorClasses = {
    primary: {
      bg: 'bg-primary-500',
      ring: 'ring-primary-400',
      glow: 'shadow-primary-500/50'
    },
    acoustic: {
      bg: 'bg-acoustic-500',
      ring: 'ring-acoustic-400', 
      glow: 'shadow-acoustic-500/50'
    },
    electric: {
      bg: 'bg-electric-500',
      ring: 'ring-electric-400',
      glow: 'shadow-electric-500/50'
    },
    frequency: {
      bg: 'bg-frequency-500',
      ring: 'ring-frequency-400',
      glow: 'shadow-frequency-500/50'
    }
  };

  const colors = colorClasses[audioTypeColor];

  return (
    <Marker
      longitude={parseFloat(recording.longitude)}
      latitude={parseFloat(recording.latitude)}
      anchor="center"
    >
      <div
        className="relative cursor-pointer transform transition-all duration-300 hover:scale-110"
        style={{ 
          width: markerSize, 
          height: markerSize,
          filter: isPlaying ? 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.6))' : 'none'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onSelect(recording)}
      >
        {/* Outer Pulse Ring for Playing State */}
        {isPlaying && (
          <div 
            className={cn(
              "absolute inset-0 rounded-full animate-ping",
              colors.bg,
              "opacity-20"
            )}
            style={{
              transform: `scale(${1 + audioLevel / 200})`,
            }}
          />
        )}
        
        {/* Main Marker Circle */}
        <div
          className={cn(
            "relative w-full h-full rounded-full border-3 border-white dark:border-gray-800 shadow-lg transition-all duration-200",
            colors.bg,
            isSelected || isHovered ? `ring-4 ${colors.ring} ${colors.glow} shadow-2xl` : '',
            isPlaying ? 'animate-pulse-glow' : ''
          )}
        >
          {/* Audio Visualizer Bars */}
          {isPlaying && (
            <div className="absolute inset-2 flex items-end justify-center space-x-0.5 rounded-full overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-white/80 rounded-full transition-all duration-100"
                  style={{
                    height: `${20 + (Math.sin(Date.now() * 0.01 + i) + 1) * 15}%`,
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Main Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isPlaying ? (
              <PauseIcon className="w-1/2 h-1/2 text-white drop-shadow-sm" />
            ) : (
              <SpeakerWaveIconSolid className="w-1/2 h-1/2 text-white drop-shadow-sm" />
            )}
          </div>
          
          {/* Quality Indicator */}
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
            <div className={cn(
              "w-2 h-2 rounded-full",
              recording.quality === 'high' ? 'bg-green-500' :
              recording.quality === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
            )} />
          </div>
        </div>
        
        {/* Hover Tooltip */}
        {isHovered && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            <div className="bg-black/80 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap backdrop-blur-sm">
              <div className="font-medium">{recording.title}</div>
              <div className="text-gray-300">{recording.artist}</div>
              <div className="flex items-center mt-1 space-x-2">
                <span className="flex items-center">
                  <HeartIcon className="w-3 h-3 mr-1" />
                  {recording.upvotes || 0}
                </span>
                <span className="flex items-center">
                  <EyeIcon className="w-3 h-3 mr-1" />
                  {recording.plays || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Marker>
  );
};

// Enhanced Recording Popup with 3D Glass Effect
const Enhanced3DPopup = ({ recording, onClose, onPlay, isPlaying }) => {
  const [currentRating, setCurrentRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown duration';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleRate = (rating) => {
    setCurrentRating(rating);
    // TODO: Implement rating API call
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement like API call
  };

  return (
    <GlassCard className="w-96 max-w-sm relative overflow-hidden">
      {/* Header with close button */}
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
            {recording.title}
          </h3>
          <p className="text-primary-600 dark:text-primary-400 font-medium">
            by {recording.artist}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/50 dark:bg-gray-800/50 text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors ml-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Audio Player */}
      <div className="px-6 pb-4">
        <AudioPlayer
          src={recording.audioUrl}
          title={recording.title}
          artist={recording.artist}
          compact={true}
          autoPlay={false}
        />
      </div>

      {/* Metadata */}
      <div className="px-6 pb-4 space-y-3">
        {recording.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {recording.description}
          </p>
        )}

        {/* Tags */}
        {recording.tags && recording.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recording.tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full border border-primary-200/50 dark:border-primary-700/50"
              >
                #{tag}
              </span>
            ))}
            {recording.tags.length > 5 && (
              <span className="px-3 py-1 bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{recording.tags.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Duration</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDuration(recording.duration)}
            </div>
          </div>
          
          <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Quality</div>
            <div className="flex items-center">
              <div className={cn(
                "w-2 h-2 rounded-full mr-2",
                recording.quality === 'high' ? 'bg-green-500' :
                recording.quality === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
              )} />
              <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {recording.quality || 'unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Actions */}
      <div className="px-6 pb-6">
        {/* Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                className="transition-colors"
              >
                {star <= currentRating ? (
                  <StarIconSolid className="w-5 h-5 text-yellow-400" />
                ) : (
                  <StarIcon className="w-5 h-5 text-gray-300 dark:text-gray-600 hover:text-yellow-400" />
                )}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all",
              isLiked 
                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
            )}
          >
            {isLiked ? (
              <HeartIconSolid className="w-4 h-4" />
            ) : (
              <HeartIcon className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{recording.upvotes || 0}</span>
          </button>
        </div>

        {/* License and User Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>License: {recording.license?.replace(/_/g, ' ') || 'Unknown'}</div>
          {recording.User && (
            <div>
              Uploaded by <span className="font-medium">{recording.User.username || recording.User.email}</span>
              {recording.User.reputation && (
                <span className="ml-1 px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-2xs">
                  {recording.User.reputation} rep
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

// Main Enhanced 3D Map Component
const Enhanced3DMap = ({ 
  recordings = [], 
  onBoundsChange,
  onRecordingClick,
  height = 'calc(100vh - 80px)',
  viewMode = 'markers',
  mapStyle = 'mapbox://styles/mapbox/dark-v11',
  showControls = true,
  className,
  ...props 
}) => {
  const mapRef = useRef();
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [playingRecording, setPlayingRecording] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: 2.3522,
    latitude: 48.8566,
    zoom: 5,
    pitch: 45,
    bearing: 0
  });
  const [mapSettings, setMapSettings] = useState({
    showSatellite: false,
    show3D: true,
    showHeatmap: false,
    clusterMarkers: true
  });

  // Heatmap layer data
  const heatmapData = useMemo(() => {
    if (viewMode !== 'heatmap' || !recordings.length) return null;

    return {
      type: 'FeatureCollection',
      features: recordings.map(recording => ({
        type: 'Feature',
        properties: {
          weight: (recording.upvotes || 0) + (recording.plays || 0) * 0.1
        },
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(recording.longitude), parseFloat(recording.latitude)]
        }
      }))
    };
  }, [recordings, viewMode]);

  const handleRecordingSelect = useCallback((recording) => {
    setSelectedRecording(recording);
    onRecordingClick?.(recording);
  }, [onRecordingClick]);

  const handleRecordingPlay = useCallback((recording) => {
    setPlayingRecording(playingRecording?.id === recording.id ? null : recording);
  }, [playingRecording]);

  const currentMapStyle = mapSettings.showSatellite 
    ? 'mapbox://styles/mapbox/satellite-streets-v12'
    : mapStyle;

  return (
    <div className={cn("relative w-full rounded-2xl overflow-hidden shadow-2xl", className)} style={{ height }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onMoveEnd={evt => {
          if (onBoundsChange) {
            const bounds = evt.target.getBounds();
            onBoundsChange({
              minLat: bounds.getSouth(),
              maxLat: bounds.getNorth(),
              minLng: bounds.getWest(),
              maxLng: bounds.getEast(),
            });
          }
        }}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={currentMapStyle}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        {...props}
      >
        {/* Controls */}
        {showControls && (
          <>
            <GeolocateControl position="top-left" />
            <FullscreenControl position="top-left" />
            <NavigationControl position="top-left" />
            <ScaleControl />
          </>
        )}

        {/* Heatmap Layer */}
        {viewMode === 'heatmap' && heatmapData && (
          <Source type="geojson" data={heatmapData}>
            <Layer
              type="heatmap"
              paint={{
                'heatmap-weight': ['get', 'weight'],
                'heatmap-intensity': 1,
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0, 'rgba(33,102,172,0)',
                  0.2, 'rgb(103,169,207)',
                  0.4, 'rgb(209,229,240)',
                  0.6, 'rgb(253,219,199)',
                  0.8, 'rgb(239,138,98)',
                  1, 'rgb(178,24,43)'
                ],
                'heatmap-radius': 60,
                'heatmap-opacity': 0.8
              }}
            />
          </Source>
        )}

        {/* Audio Markers */}
        {viewMode === 'markers' && recordings.map(recording => (
          <Audio3DMarker
            key={recording.id}
            recording={recording}
            isSelected={selectedRecording?.id === recording.id}
            isPlaying={playingRecording?.id === recording.id}
            onSelect={handleRecordingSelect}
            onPlay={handleRecordingPlay}
            viewMode={viewMode}
            zoom={viewState.zoom}
          />
        ))}

        {/* Enhanced Popup */}
        {selectedRecording && (
          <Popup
            longitude={parseFloat(selectedRecording.longitude)}
            latitude={parseFloat(selectedRecording.latitude)}
            onClose={() => setSelectedRecording(null)}
            closeOnClick={false}
            anchor="bottom"
            className="z-50"
            maxWidth="none"
          >
            <Enhanced3DPopup
              recording={selectedRecording}
              onClose={() => setSelectedRecording(null)}
              onPlay={handleRecordingPlay}
              isPlaying={playingRecording?.id === selectedRecording.id}
            />
          </Popup>
        )}
      </Map>

      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        {/* View Mode Toggle */}
        <GlassCard className="p-3">
          <div className="flex rounded-lg bg-gray-100/50 dark:bg-gray-800/50 p-1">
            <button
              onClick={() => setViewState(prev => ({ ...prev, viewMode: 'markers' }))}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                viewMode === 'markers'
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              3D
            </button>
            <button
              onClick={() => setViewState(prev => ({ ...prev, viewMode: 'heatmap' }))}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                viewMode === 'heatmap'
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Heat
            </button>
          </div>
        </GlassCard>

        {/* Quick Settings */}
        <GlassCard className="p-3">
          <div className="space-y-2">
            <button
              onClick={() => setMapSettings(prev => ({ ...prev, showSatellite: !prev.showSatellite }))}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors",
                mapSettings.showSatellite
                  ? "bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <span>Satellite</span>
              <div className={cn(
                "w-4 h-4 rounded border-2 transition-colors",
                mapSettings.showSatellite
                  ? "bg-primary-600 border-primary-600"
                  : "border-gray-300 dark:border-gray-600"
              )}>
                {mapSettings.showSatellite && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Recording Count Badge */}
      {recordings?.length > 0 && (
        <div className="absolute bottom-6 left-6 z-10">
          <GlassCard className="px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {recordings.length} recording{recordings.length !== 1 ? 's' : ''}
              </span>
              {playingRecording && (
                <div className="flex items-center ml-2 text-primary-600 dark:text-primary-400">
                  <SpeakerWaveIconSolid className="w-4 h-4 mr-1" />
                  <span className="text-xs">Playing</span>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Enhanced3DMap;