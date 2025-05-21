import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';

// Il est important de s'assurer que les styles de leaflet.markercluster sont importés
// Quelque part dans l'application, par exemple dans index.js ou App.jsx
// import 'leaflet.markercluster/dist/MarkerCluster.css';
// import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const MapView = ({ recordings }) => {
  if (!recordings || recordings.length === 0) {
    return (
      <div className="flex justify-center items-center h-full w-full bg-neutral text-text-secondary p-4 rounded-lg">
        <p>Aucun enregistrement à afficher sur la carte.</p>
      </div>
    );
  }

  return (
    <MapContainer center={[46.603354, 1.888334]} zoom={5} className="h-full w-full rounded-lg shadow-lg">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MarkerClusterGroup>
        {recordings.map((rec) => (
          <Marker key={rec._id || rec.id} position={[rec.latitude, rec.longitude]}>
            <Popup>
              <div className="p-1 text-text-primary transition-all duration-300 ease-in-out">
                <strong className="text-lg block mb-1 text-primary hover:opacity-75 transition-opacity duration-300 ease-in-out">{rec.title}</strong>
                <span className="text-sm text-text-secondary block mb-2 hover:opacity-75 transition-opacity duration-300 ease-in-out">Artiste: {rec.artist || 'Inconnu'}</span>
                {rec.audioUrl && (
                  <audio controls src={rec.audioUrl} className="w-full mt-2 rounded transition-all duration-300 ease-in-out transform hover:scale-105" />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default MapView;