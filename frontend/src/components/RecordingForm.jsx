import React, { useState, useCallback, useRef } from 'react';
import { useRecordings } from '../hooks/useRecordings';
import { useWeb3 } from '../hooks/useWeb3';
import {
  CloudArrowUpIcon,
  MicrophoneIcon,
  MapPinIcon,
  TagIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import {
  DocumentIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/solid';

const LICENSE_OPTIONS = [
  { value: 'ALL_RIGHTS_RESERVED', label: 'All Rights Reserved' },
  { value: 'CC_BY', label: 'Creative Commons Attribution 4.0' },
  { value: 'CC_BY_SA', label: 'Creative Commons Attribution-ShareAlike 4.0' },
  { value: 'CC_BY_NC', label: 'Creative Commons Attribution-NonCommercial 4.0' },
  { value: 'CC_BY_NC_SA', label: 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0' },
  { value: 'CC_BY_ND', label: 'Creative Commons Attribution-NoDerivatives 4.0' },
  { value: 'CC_BY_NC_ND', label: 'Creative Commons Attribution-NonCommercial-NoDerivatives 4.0' },
  { value: 'PUBLIC_DOMAIN', label: 'Public Domain (CC0)' }
];

const QUALITY_OPTIONS = [
  { value: 'LOW', label: 'Low Quality' },
  { value: 'MEDIUM', label: 'Medium Quality' },
  { value: 'HIGH', label: 'High Quality' },
  { value: 'LOSSLESS', label: 'Lossless' }
];

const RecordingForm = ({ onSuccess, onCancel }) => {
  const { createRecording, isLoading } = useRecordings();
  const { addRecording: addBlockchainRecording, isConnected } = useWeb3();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    artist: '',
    latitude: '',
    longitude: '',
    tags: '',
    equipment: '',
    license: 'ALL_RIGHTS_RESERVED',
    quality: 'MEDIUM'
  });
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  
  const steps = [
    { id: 1, title: 'Fichier Audio', icon: MusicalNoteIcon, description: 'Sélectionnez votre enregistrement' },
    { id: 2, title: 'Informations', icon: DocumentIcon, description: 'Décrivez votre création' },
    { id: 3, title: 'Localisation', icon: MapPinIcon, description: 'Où avez-vous enregistré ?' },
    { id: 4, title: 'Finalisation', icon: CheckCircleIcon, description: 'Vérifiez et publiez' }
  ];

  // Validation functions
  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 1:
        if (!audioFile) errors.audioFile = 'Un fichier audio est requis';
        break;
      case 2:
        if (!formData.title.trim()) errors.title = 'Le titre est requis';
        if (!formData.artist.trim()) errors.artist = 'L\'artiste est requis';
        break;
      case 3:
        if (!formData.latitude || !formData.longitude) {
          errors.location = 'La localisation est requise';
        }
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileSelect = (file) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac'];
    if (!allowedTypes.includes(file.type)) {
      setError('Veuillez sélectionner un fichier audio valide (MP3, WAV, OGG, MP4, FLAC)');
      return;
    }
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError('La taille du fichier doit être inférieure à 100MB');
      return;
    }
    
    setAudioFile(file);
    setError('');
    
    // Create audio preview URL
    const previewUrl = URL.createObjectURL(file);
    setAudioPreview(previewUrl);
    
    // Clear validation error
    if (validationErrors.audioFile) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.audioFile;
        return newErrors;
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  // Audio preview handlers
  const toggleAudioPreview = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Step navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        setLocationLoading(false);
      },
      (error) => {
        setError('Unable to retrieve your location: ' + error.message);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!audioFile) {
      setError('Please select an audio file');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError('Please provide location coordinates');
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('audioFile', audioFile);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('artist', formData.artist);
      submitData.append('latitude', parseFloat(formData.latitude));
      submitData.append('longitude', parseFloat(formData.longitude));
      submitData.append('license', formData.license);
      submitData.append('equipment', formData.equipment);
      
      if (formData.tags) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        submitData.append('tags', JSON.stringify(tagsArray));
      }

      const result = await createRecording(submitData);
      
      if (isConnected && addBlockchainRecording) {
        try {
          await addBlockchainRecording({
            title: formData.title,
            description: formData.description,
            ipfsHash: '', // Would be populated after IPFS upload
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            duration: 0, // Would be extracted from audio file
            quality: QUALITY_OPTIONS.findIndex(q => q.value === formData.quality),
            equipment: formData.equipment,
            license: LICENSE_OPTIONS.findIndex(l => l.value === formData.license)
          });
        } catch (blockchainError) {
          console.warn('Failed to add to blockchain:', blockchainError);
        }
      }

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      setError(err.message || 'Failed to create recording');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-xl mb-8">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-medium mb-4">
              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
              Nouvel Enregistrement
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Partagez votre Paysage Sonore
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Suivez les étapes pour publier votre enregistrement sur la blockchain
            </p>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => goToStep(step.id)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                        isCompleted 
                          ? 'bg-green-500 text-white'
                          : isActive 
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon className="h-6 w-6" />
                      ) : (
                        <IconComponent className="h-6 w-6" />
                      )}
                    </button>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Erreur</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError('')}
            className="ml-auto flex-shrink-0 text-red-400 hover:text-red-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-xl">
        <form onSubmit={handleSubmit} className="p-8">
          {/* Step 1: Audio File Upload */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <MusicalNoteIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Sélectionnez votre fichier audio
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Glissez-déposez votre enregistrement ou cliquez pour parcourir
                </p>
              </div>
              
              {/* File Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-200 ${
                  isDragOver
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : validationErrors.audioFile
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/flac"
                  className="sr-only"
                  id="audio-upload"
                />
                
                {!audioFile ? (
                  <div>
                    <CloudArrowUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Glissez votre fichier audio ici
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">ou</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors duration-200"
                      >
                        <DocumentIcon className="h-5 w-5 mr-2" />
                        Parcourir les fichiers
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                      MP3, WAV, OGG, MP4, FLAC jusqu'à 100MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <MusicalNoteIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">{audioFile.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    
                    {/* Audio Preview */}
                    {audioPreview && (
                      <div className="bg-white/60 dark:bg-gray-700/60 rounded-2xl p-4">
                        <div className="flex items-center justify-center space-x-4">
                          <button
                            type="button"
                            onClick={toggleAudioPreview}
                            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors duration-200"
                          >
                            {isPlaying ? (
                              <PauseIcon className="h-6 w-6" />
                            ) : (
                              <PlayIcon className="h-6 w-6" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <SpeakerWaveIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Prévisualisation audio
                              </span>
                            </div>
                          </div>
                        </div>
                        <audio
                          ref={audioRef}
                          src={audioPreview}
                          onEnded={handleAudioEnded}
                          className="hidden"
                        />
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => {
                        setAudioFile(null);
                        setAudioPreview(null);
                        setIsPlaying(false);
                      }}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                    >
                      Changer de fichier
                    </button>
                  </div>
                )}
                
                {validationErrors.audioFile && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.audioFile}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Step 2: Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <DocumentIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Informations sur l'enregistrement
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Décrivez votre paysage sonore pour la communauté
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    maxLength={100}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 ${
                      validationErrors.title
                        ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                    placeholder="Titre de votre enregistrement"
                  />
                  {validationErrors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.title}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Artiste *
                  </label>
                  <input
                    type="text"
                    name="artist"
                    value={formData.artist}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 ${
                      validationErrors.artist
                        ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                    placeholder="Votre nom d'artiste"
                  />
                  {validationErrors.artist && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.artist}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Décrivez votre enregistrement, le contexte, l'ambiance..."
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formData.description.length}/500 caractères
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Équipement
                  </label>
                  <input
                    type="text"
                    name="equipment"
                    value={formData.equipment}
                    onChange={handleInputChange}
                    maxLength={100}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                    placeholder="ex: Zoom H4n, iPhone 12"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Licence
                  </label>
                  <select
                    name="license"
                    value={formData.license}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                  >
                    {LICENSE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (séparés par des virgules)
                </label>
                <div className="relative">
                  <TagIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                    placeholder="nature, forêt, oiseaux, rivière"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Ajoutez des mots-clés pour aider à découvrir votre enregistrement
                </p>
              </div>
            </div>
          )}
          
          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <MapPinIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Localisation de l'enregistrement
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Où avez-vous capturé ce paysage sonore ?
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    required
                    step="any"
                    min="-90"
                    max="90"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 ${
                      validationErrors.latitude
                        ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                    placeholder="ex: 48.8566"
                  />
                  {validationErrors.latitude && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.latitude}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    required
                    step="any"
                    min="-180"
                    max="180"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200 ${
                      validationErrors.longitude
                        ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                    placeholder="ex: 2.3522"
                  />
                  {validationErrors.longitude && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.longitude}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Astuce pour obtenir les coordonnées
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      Utilisez votre smartphone ou un service comme Google Maps pour obtenir les coordonnées GPS précises de votre lieu d'enregistrement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Finalization */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Finalisation
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Vérifiez vos informations avant publication
                </p>
              </div>
              
              {/* Summary */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Résumé de votre enregistrement
                </h3>
                
                <div className="space-y-4">
                  {audioFile && (
                    <div className="flex items-center space-x-3">
                      <MusicalNoteIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong>Fichier:</strong> {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <DocumentIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong>Titre:</strong> {formData.title || 'Non spécifié'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong>Artiste:</strong> {formData.artist || 'Non spécifié'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong>Localisation:</strong> {formData.latitude && formData.longitude ? `${formData.latitude}, ${formData.longitude}` : 'Non spécifiée'}
                    </span>
                  </div>
                  
                  {formData.description && (
                    <div className="flex items-start space-x-3">
                      <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong>Description:</strong> {formData.description}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Upload Progress */}
              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progression du téléchargement
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Step Navigation */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={`inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentStep === 1
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5 mr-2" />
              Précédent
            </button>
            
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    step === currentStep
                      ? 'bg-indigo-600 dark:bg-indigo-400'
                      : step < currentStep
                      ? 'bg-green-500 dark:bg-green-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!canProceedToNextStep()}
                className={`inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  canProceedToNextStep()
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                Suivant
                <ChevronRightIcon className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || !canProceedToNextStep()}
                className={`inline-flex items-center px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isLoading || !canProceedToNextStep()
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Publication...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Publier l'enregistrement
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordingForm;
