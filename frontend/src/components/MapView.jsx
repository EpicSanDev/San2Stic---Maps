import React, { useState, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRecordings } from '../hooks/useRecordings';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const RecordingPopup = ({ recording, onClose }) => {
  const formatDuration = (seconds) => {
    if (!seconds) return 'Durée inconnue';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatLicense = (license) => {
    return license.replace(/_/g, ' ').replace(/CC BY/g, 'CC BY');
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md text-gray-900 dark:text-white rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-6 max-w-sm w-full">
      <button 
        onClick={onClose} 
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200"
        aria-label="Fermer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">{recording.title}</h3>
          <p className="text-indigo-600 dark:text-indigo-400 font-medium">par {recording.artist}</p>
        </div>
        
        {recording.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{recording.description}</p>
        )}
        
        {recording.tags && recording.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recording.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full border border-indigo-200 dark:border-indigo-700">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Durée:</span>
            <span className="ml-1">{formatDuration(recording.duration)}</span>
          </div>
          
          {recording.quality && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <span className="font-medium">Qualité:</span>
              <span className="ml-1">{recording.quality}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium">Licence:</span>
            <span className="ml-1">{formatLicense(recording.license)}</span>
          </div>
          
          {recording.equipment && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="font-medium">Équipement:</span>
              <span className="ml-1">{recording.equipment}</span>
            </div>
          )}
          
          {recording.User && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Uploadé par:</span>
              <span className="ml-1">{recording.User.username || recording.User.email}</span>
              {recording.User.reputation && (
                <span className="ml-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
                  {recording.User.reputation} rep
                </span>
              )}
            </div>
          )}
        </div>
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
  const [viewState] = useState({
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
      <div className="relative group cursor-pointer">
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition-all duration-300 group-hover:blur-sm"></div>
        <div className="relative w-10 h-10 bg-white dark:bg-gray-900 rounded-full shadow-lg border-2 border-indigo-500 dark:border-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" clipRule="evenodd" />
          </svg>
        </div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-indigo-500 dark:border-t-indigo-400"></div>
      </div>
    </Marker>
  )), [recordings]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-indigo-200/50 dark:border-gray-700/50" style={{ height }}>
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 dark:border-gray-700 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Chargement de la carte</h3>
          <p className="text-gray-600 dark:text-gray-300">Récupération des enregistrements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl border border-red-200/50 dark:border-red-700/50" style={{ height }}>
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Erreur de chargement</h3>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!recordings || recordings.length === 0) {
    return (
      <div className="flex justify-center items-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50" style={{ height }}>
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucun enregistrement trouvé</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Commencez par téléverser un enregistrement pour le voir apparaître sur la carte.</p>
          <button 
            onClick={() => window.location.href = '/upload'} 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Téléverser un enregistrement
          </button>
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
