import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Assurez-vous qu'axios est listé dans les dépendances de package.json

const RadioPlayer = ({ streamUrl = 'http://localhost:8000/stream', metadataUrl = 'http://localhost:8000/status-json.xsl' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [metadata, setMetadata] = useState({ title: 'Chargement...' });
  const audioRef = useRef(null);

  // Contrôle de la lecture audio
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => console.error("Erreur de lecture audio:", error));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Récupération des métadonnées
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get(metadataUrl);
        // La structure exacte peut varier, adaptez en fonction de la réponse d'Icecast
        // Souvent, les informations se trouvent dans response.data.icestats.source
        const source = response.data?.icestats?.source;
        if (source) {
          const title = source.title || source.song || 'Titre indisponible';
          // Pour l'artwork, cela dépendra de la configuration d'Icecast et de la source.
          // Exemple: const artworkUrl = source.artwork_url;
          setMetadata({ title });
        } else {
          setMetadata({ title: 'Métadonnées indisponibles' });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des métadonnées:', error);
        setMetadata({ title: 'Erreur de métadonnées' });
      }
    };

    fetchMetadata(); // Appel initial
    const intervalId = setInterval(fetchMetadata, 10000); // Polling toutes les 10 secondes

    return () => clearInterval(intervalId); // Nettoyage à la suppression du composant
  }, [metadataUrl]);

  // Synchronisation de l'état de lecture avec l'élément audio (par exemple, si l'utilisateur utilise les contrôles natifs si visibles)
  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      audioElement.addEventListener('play', handlePlay);
      audioElement.addEventListener('playing', handlePlay); // Pour certains navigateurs/cas
      audioElement.addEventListener('pause', handlePause);
      audioElement.addEventListener('ended', handlePause);

      return () => {
        audioElement.removeEventListener('play', handlePlay);
        audioElement.removeEventListener('playing', handlePlay);
        audioElement.removeEventListener('pause', handlePause);
        audioElement.removeEventListener('ended', handlePause);
      };
    }
  }, []);


  return (
    <div className="bg-background text-text-primary p-3 sm:p-4 rounded-lg shadow-xl w-full max-w-md mx-auto border border-neutral">
      <audio ref={audioRef} src={streamUrl} className="hidden" preload="none">
        Votre navigateur ne supporte pas l'élément audio.
      </audio>
      <div className="flex items-center justify-between space-x-3 sm:space-x-4">
        {/* Artwork */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-neutral rounded flex items-center justify-center flex-shrink-0">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-text-secondary">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
          </svg>
        </div>

        <div className="flex-grow min-w-0"> {/* min-w-0 pour s'assurer que truncate fonctionne bien dans un flex item */}
          <h2
            className={`text-md sm:text-lg font-semibold truncate text-text-primary ${metadata.title === 'Chargement...' || metadata.title === 'Erreur de métadonnées' || metadata.title === 'Métadonnées indisponibles' ? 'animate-pulse' : ''}`}
            title={metadata.title}
          >
            {metadata.title}
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary">Radio San2Stic</p>
        </div>

        <button
          onClick={togglePlayPause}
          className="bg-primary hover:bg-opacity-80 focus:bg-opacity-70 text-white p-2 sm:p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-all duration-300 ease-in-out transform hover:scale-110 focus:scale-105 flex-shrink-0"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
          ) : (
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L8.029 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default RadioPlayer;