import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWeb3 } from '../hooks/useWeb3';
import { useNavigate } from 'react-router-dom';
import {
  CloudArrowUpIcon,
  CubeIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const Advanced = () => {
  const { user } = useAuth();
  const { web3Service } = useWeb3();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Obtenir la géolocalisation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => setError('Échec de la géolocalisation: ' + err.message)
      );
    } else {
      setError('Géolocalisation non supportée');
    }
  }, [user, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Vérifier le type de fichier
      if (!selectedFile.type.startsWith('audio/')) {
        setError('Veuillez sélectionner un fichier audio valide');
        return;
      }
      // Vérifier la taille (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (max 50MB)');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDirectUpload = async () => {
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
      setSuccess(null);
      
      // Connecter le portefeuille si nécessaire
      if (!web3Service.isConnected()) {
        await web3Service.connectWallet();
      }
      
      // Upload vers IPFS
      const ipfsResult = await web3Service.uploadAudioToIPFS(file);
      
      // Créer l'enregistrement sur la blockchain
      const recordingData = {
        title: file.name,
        description: 'Upload direct vers IPFS et Blockchain',
        ipfsHash: ipfsResult.hash,
        latitude: location.lat,
        longitude: location.lng,
        artist: user.username || user.email,
        tags: ['direct-upload'],
        license: 'ALL_RIGHTS_RESERVED'
      };
      
      const blockchainResult = await web3Service.createRecording(recordingData);
      
      setSuccess({
        ipfsHash: ipfsResult.hash,
        transactionHash: blockchainResult.transactionHash,
        ipfsUrl: `https://ipfs.io/ipfs/${ipfsResult.hash}`
      });
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('Erreur lors de l\'upload: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Retour
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Upload Avancé
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload direct vers IPFS et enregistrement sur la blockchain. 
              Cette fonctionnalité est destinée aux utilisateurs avancés.
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Fonctionnalité Avancée
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Cette page permet un upload direct vers IPFS et la blockchain, sans passer par notre API backend. 
                Assurez-vous d'avoir un portefeuille Web3 connecté et des fonds suffisants pour les frais de transaction.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Sélectionner un fichier audio
          </h2>
          
          {/* File Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fichier audio (max 50MB)
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300 dark:hover:file:bg-indigo-900/50"
            />
          </div>

          {/* File Info */}
          {file && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Fichier sélectionné:</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Nom: {file.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Taille: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Type: {file.type}</p>
            </div>
          )}

          {/* Location Info */}
          {location && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Position géographique:</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Latitude: {location.lat.toFixed(6)}, Longitude: {location.lng.toFixed(6)}
              </p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleDirectUpload}
            disabled={!file || !location || isUploading}
            className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                Upload en cours...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-6 w-6 mr-3" />
                Upload vers IPFS et Blockchain
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-xl">
              <div className="flex items-start mb-4">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                    Upload réussi !
                  </h3>
                  <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                    <div className="flex items-center">
                      <CubeIcon className="h-4 w-4 mr-2" />
                      <span className="font-medium">Hash IPFS:</span>
                      <code className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-800/30 rounded text-xs">
                        {success.ipfsHash}
                      </code>
                    </div>
                    <div className="flex items-center">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      <span className="font-medium">Lien IPFS:</span>
                      <a 
                        href={success.ipfsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-green-600 dark:text-green-400 hover:underline text-xs"
                      >
                        Voir sur IPFS
                      </a>
                    </div>
                    <div className="flex items-center">
                      <CubeIcon className="h-4 w-4 mr-2" />
                      <span className="font-medium">Transaction:</span>
                      <code className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-800/30 rounded text-xs">
                        {success.transactionHash}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
            À propos de cette fonctionnalité
          </h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
            <li>• Upload direct vers le réseau IPFS décentralisé</li>
            <li>• Enregistrement immédiat sur la blockchain</li>
            <li>• Propriété cryptographique prouvable</li>
            <li>• Pas de stockage sur nos serveurs</li>
            <li>• Frais de transaction à votre charge</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Advanced;
