import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import { useRecordings } from '../hooks/useRecordings';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const RecordingPopup = ({ recording }) => {
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
    <div className="p-3 min-w-[250px]">
      <h3 className="font-bold text-lg text-gray-800 mb-1">{recording.title}</h3>
      <p className="text-gray-600 mb-2">by {recording.artist}</p>
      
      {recording.description && (
        <p className="text-sm text-gray-700 mb-2">{recording.description}</p>
      )}
      
      <div className="flex flex-wrap gap-1 mb-2">
        {recording.tags && recording.tags.map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 mb-2 space-y-1">
        <div>Duration: {formatDuration(recording.duration)}</div>
        <div>Quality: {recording.quality}</div>
        <div>License: {formatLicense(recording.license)}</div>
        {recording.equipment && <div>Equipment: {recording.equipment}</div>}
        {recording.User && (
          <div>
            Uploaded by: {recording.User.username || recording.User.email}
            {recording.User.reputation && ` (${recording.User.reputation} rep)`}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
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

const MapView = ({ recordings: propRecordings, height = '500px' }) => {
  const { recordings: hookRecordings, isLoading, error } = useRecordings();
  const [map, setMap] = useState(null);
  
  const recordings = propRecordings || hookRecordings;

  useEffect(() => {
    if (map && recordings.length > 0) {
      const group = new L.featureGroup(recordings.map(recording => 
        L.marker([parseFloat(recording.latitude), parseFloat(recording.longitude)])
      ));
      
      if (group.getBounds().isValid()) {
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [map, recordings]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center bg-gray-100 rounded-lg" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recordings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center bg-red-50 border border-red-200 rounded-lg" style={{ height }}>
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading map</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!recordings || recordings.length === 0) {
    return (
      <div className="flex justify-center items-center bg-gray-100 rounded-lg" style={{ height }}>
        <div className="text-center text-gray-600">
          <p className="text-lg font-semibold">No recordings found</p>
          <p className="text-sm">Upload some recordings to see them on the map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg" style={{ height }}>
      <MapContainer
        center={[46.603354, 1.888334]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMap}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MarkerClusterGroup>
          {recordings.map((recording) => (
            <Marker
              key={recording._id || recording.id}
              position={[parseFloat(recording.latitude), parseFloat(recording.longitude)]}
            >
              <Popup maxWidth={300} className="custom-popup">
                <RecordingPopup recording={recording} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default MapView;
