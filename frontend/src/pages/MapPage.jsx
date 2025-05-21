import React from 'react';
import MapView from '../components/MapView';
import useRecordings from '../hooks/useRecordings';

const MapPage = () => {
  const { recordings, isLoading, error } = useRecordings();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-background text-text-primary">
        <svg aria-hidden="true" className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg">Chargement de la carte et des enregistrements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-background text-red-500 p-4">
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-lg text-center">Erreur lors du chargement des données:</p>
        <p className="text-sm text-center mt-1">{error.message || JSON.stringify(error)}</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Vous pouvez ajouter un Navbar ou d'autres éléments ici si nécessaire */}
      <div className="flex-grow p-4 md:p-0">
        <MapView recordings={recordings} />
      </div>
    </div>
  );
};

export default MapPage;