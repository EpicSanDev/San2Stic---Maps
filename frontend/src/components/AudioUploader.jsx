import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';

export const AudioUploader = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const { web3Service } = useWeb3();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => setError('Échec de la géolocalisation: ' + err.message)
      );
    } else {
      setError('Géolocalisation non supportée');
    }
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier audio');
      return;
    }
    if (!location) {
      setError('Position géographique requise');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      if (!web3Service.isConnected()) {
        await web3Service.connectWallet();
      }
      
      const ipfsResult = await web3Service.uploadAudioToIPFS(file);
      
      const recordingData = {
        title: file.name,
        description: 'Enregistrement audio',
        ipfsHash: ipfsResult.hash,
        latitude: location.lat,
        longitude: location.lng,
        tags: [],
        duration: 0, // À calculer si possible
        quality: 1, // MEDIUM par défaut
        equipment: 'Inconnu',
        license: 0 // CC_BY par défaut
      };
      
      await web3Service.addRecording(recordingData);
      
      onUploadComplete({
        ipfsHash: ipfsResult.hash,
        ipfsUrl: ipfsResult.url,
        fileName: file.name,
        fileSize: file.size,
        location
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Upload Audio</h3>
      
      <input 
        type="file" 
        accept="audio/*" 
        onChange={handleFileChange}
        className="mb-4"
      />
      
      {file && (
        <div className="mb-4">
          <p>Fichier sélectionné: {file.name}</p>
          <p>Taille: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}
      
      {location && (
        <div className="mb-4">
          <p>Position: Lat {location.lat.toFixed(4)}, Lng {location.lng.toFixed(4)}</p>
        </div>
      )}
      
      <button 
        onClick={handleUpload}
        disabled={!file || !location || isUploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isUploading ? 'Upload en cours...' : 'Upload vers IPFS et Blockchain'}
      </button>
      
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};