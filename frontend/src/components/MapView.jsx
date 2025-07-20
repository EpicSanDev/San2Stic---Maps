import React, { useState, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRecordings } from '../hooks/useRecordings';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const RecordingPopup = ({ recording, onClose }) => {
  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown duration';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatLicense = (license) => {
    return license.replace(/_/g, ' ').replace(/CC BY/g, 'CC BY');
  };

  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-xl p-4 max-w-xs w-full">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">&times;</button>
      <h3 className="font-bold text-lg mb-2">{recording.title}</h3>
      <p className="text-gray-400 mb-3">by {recording.artist}</p>
      
      {recording.description && (
        <p className="text-sm text-gray-300 mb-3">{recording.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mb-3">
        {recording.tags && recording.tags.map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="text-xs text-gray-400 mb-3 space-y-1">
        <div>Duration: {formatDuration(recording.duration)}</div>
        <div>Quality: {recording.quality}</div>
        <div>License: {formatLicense(recording.license)}</div>
        {recording.equipment && <div>Equipment: {recording.equipment}</div>}
        {recording.User && (
          <div>
            Uploader: {recording.User.username || recording.User.email}
            {recording.User.reputation && ` (${recording.User.reputation} rep)`}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
        <span>👍 {recording.upvotes || 0}</span>
        <span>👎 {recording.downvotes || 0}</span>
        {recording.ratingCount > 0 && (
          <span>⭐ {(recording.totalRating / recording.ratingCount).toFixed(1)}</span>
        )}
      </div>
      
      {recording.audioUrl && (
        <audio controls className="w-full mt-2">
          <source src={recording.audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

const MapView = ({ recordings: propRecordings, onBoundsChange, height = 'calc(100vh - 80px)' }) => {
  const { recordings: hookRecordings, isLoading, error } = useRecordings();
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: 2.3522,
    latitude: 48.8566,
    zoom: 5
  });

  const recordings = propRecordings || hookRecordings;

  const markers = useMemo(() => recordings.map(rec => (
    <Marker 
      key={rec.id} 
      longitude={parseFloat(rec.longitude)} 
      latitude={parseFloat(rec.latitude)}
      anchor="bottom"
      onClick={e => {
        e.originalEvent.stopPropagation();
        setSelectedRecording(rec);
      }}
    >
       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 drop-shadow-lg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    </Marker>
  )), [recordings]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center bg-gray-900 text-white rounded-lg" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Map & Recordings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center bg-red-900 bg-opacity-50 border border-red-700 text-white rounded-lg" style={{ height }}>
        <div className="text-center">
          <p className="font-semibold">Error loading map</p>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!recordings || recordings.length === 0) {
    return (
      <div className="flex justify-center items-center bg-gray-900 text-white rounded-lg" style={{ height }}>
        <div className="text-center text-gray-400">
          <p className="text-lg font-semibold">No recordings found</p>
          <p className="text-sm">Upload a recording to see it on the map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl" style={{ height }}>
      <Map
        {...viewState}
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
        mapStyle="mapbox://styles/mapbox/dark-v10"
        style={{ width: '100%', height: '100%' }}
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />

        {markers}

        {selectedRecording && (
          <Popup
            longitude={parseFloat(selectedRecording.longitude)}
            latitude={parseFloat(selectedRecording.latitude)}
            onClose={() => setSelectedRecording(null)}
            closeOnClick={false}
            anchor="bottom"
            className="z-10"
          >
            <RecordingPopup recording={selectedRecording} onClose={() => setSelectedRecording(null)} />
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapView;
