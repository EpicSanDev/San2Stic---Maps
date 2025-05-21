import React, { useState } from 'react';
import useRecordings from '../hooks/useRecordings'; // Importer le hook

const AudioUploadForm = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState(''); // Ajout du champ artiste
  const [coords, setCoords] = useState({ lat: '', lng: '' });
  const [message, setMessage] = useState(''); // Pour les messages de succès/erreur
  const [isSubmitting, setIsSubmitting] = useState(false); // Pour l'état de soumission

  const { createRecording, isLoading, error: submissionError } = useRecordings(); // Utiliser le hook

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(''); // Réinitialiser le message lors du changement de fichier
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString(),
          });
          setMessage('Position actuelle récupérée.');
        },
        (err) => {
          console.error("Erreur de géolocalisation:", err);
          setMessage(`Erreur de géolocalisation: ${err.message}`);
        }
      );
    } else {
      setMessage("La géolocalisation n'est pas supportée par ce navigateur.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    if (!file || !title || !artist || !coords.lat || !coords.lng) {
      setMessage('Tous les champs sont requis (fichier, titre, artiste, latitude, longitude).');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('latitude', coords.lat);
    formData.append('longitude', coords.lng);

    try {
      await createRecording(formData);
      setMessage('Enregistrement audio uploadé avec succès !');
      // Réinitialiser le formulaire (optionnel)
      setFile(null);
      setTitle('');
      setArtist('');
      setCoords({ lat: '', lng: '' });
      // Vider le champ de fichier manuellement si nécessaire (plus complexe, dépend du navigateur)
      if (e.target.elements.audioFile) { // Assurez-vous que l'input file a un name="audioFile"
        e.target.elements.audioFile.value = null;
      }
    } catch (err) {
      // L'erreur est déjà gérée et définie dans submissionError par le hook
      // On peut utiliser submissionError pour afficher un message plus spécifique si besoin
      setMessage(submissionError || 'Erreur lors de l\'upload. Veuillez réessayer.');
      console.error("Erreur lors de la soumission:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-background shadow-xl rounded-lg p-6 sm:p-8 mb-4 space-y-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-text-primary">Ajouter un Son</h2>

      {message && (
        <div
          className={`p-3 rounded mb-4 text-sm transition-opacity duration-300 ease-in-out ${
            submissionError || message.startsWith('Erreur') || message.startsWith('Tous les champs')
              ? 'bg-red-100 border border-red-400 text-red-700'
              : 'bg-green-100 border border-green-400 text-green-700'
          } ${message ? 'opacity-100' : 'opacity-0'}`}
        >
          {message}
        </div>
      )}
      {submissionError && !message.includes(submissionError) && (
         <div className="p-3 rounded mb-4 text-sm bg-red-100 border border-red-400 text-red-700 transition-opacity duration-300 ease-in-out opacity-100">
            Erreur serveur: {submissionError}
         </div>
      )}


      <div>
        <label htmlFor="title" className="block text-text-secondary text-sm font-bold mb-2">Titre</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="shadow appearance-none border border-neutral rounded w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300 ease-in-out"
          required
        />
      </div>

      <div>
        <label htmlFor="artist" className="block text-text-secondary text-sm font-bold mb-2">Artiste</label>
        <input
          id="artist"
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="shadow appearance-none border border-neutral rounded w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300 ease-in-out"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:space-x-4">
        <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
          <label htmlFor="latitude" className="block text-text-secondary text-sm font-bold mb-2">Latitude</label>
          <input
            id="latitude"
            type="number"
            step="any"
            value={coords.lat}
            onChange={(e) => setCoords({ ...coords, lat: e.target.value })}
            className="shadow appearance-none border border-neutral rounded w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300 ease-in-out"
            required
          />
        </div>
        <div className="w-full sm:w-1/2">
          <label htmlFor="longitude" className="block text-text-secondary text-sm font-bold mb-2">Longitude</label>
          <input
            id="longitude"
            type="number"
            step="any"
            value={coords.lng}
            onChange={(e) => setCoords({ ...coords, lng: e.target.value })}
            className="shadow appearance-none border border-neutral rounded w-full py-2 px-3 text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300 ease-in-out"
            required
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleGeolocation}
        disabled={isSubmitting} // Désactiver pendant la soumission globale ou si on ajoute un état de chargement spécifique à la géoloc
        className="w-full bg-secondary hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all duration-300 ease-in-out flex items-center justify-center"
      >
        {/* Ajout d'une icône simple pour la géolocalisation, pourrait être amélioré avec une animation */}
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${message.startsWith('Position actuelle récupérée.') ? 'animate-ping opacity-50' : ''} ${message.startsWith('Erreur de géolocalisation:') ? 'text-red-300' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Obtenir ma position actuelle
      </button>

      <div>
        <label htmlFor="audioFile" className="block text-text-secondary text-sm font-bold mb-2">Fichier Audio</label>
        <input
          id="audioFile"
          name="audioFile" // Important pour la réinitialisation
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-text-secondary
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-accent file:text-text-primary
            hover:file:bg-opacity-90 file:transition-colors file:duration-300 file:ease-in-out cursor-pointer"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isLoading}
        className={`w-full bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary/50 transition-all duration-300 ease-in-out flex items-center justify-center ${ (isSubmitting || isLoading) ? 'animate-pulse' : ''}`}
      >
        {(isSubmitting || isLoading) ? (
          <>
            <svg aria-hidden="true" className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Envoi en cours...
          </>
        ) : 'Uploader le Son'}
      </button>
    </form>
  );
};

export default AudioUploadForm;