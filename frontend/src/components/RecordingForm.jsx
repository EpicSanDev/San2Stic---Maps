import React, { useState } from 'react';
import { useRecordings } from '../hooks/useRecordings';
import { useWeb3 } from '../hooks/useWeb3';

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
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid audio file (MP3, WAV, OGG, or MP4)');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('File size must be less than 50MB');
        return;
      }
      setAudioFile(file);
      setError('');
    }
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
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Recording</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Recording title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Artist *
            </label>
            <input
              type="text"
              name="artist"
              value={formData.artist}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Artist name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your recording..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audio File *
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Supported formats: MP3, WAV, OGG, MP4 (max 50MB)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude *
            </label>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              required
              step="any"
              min={-90}
              max={90}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 48.8566"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitude *
            </label>
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              required
              step="any"
              min={-180}
              max={180}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 2.3522"
            />
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={locationLoading}
            className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {locationLoading ? 'Getting location...' : 'Use Current Location'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License
            </label>
            <select
              name="license"
              value={formData.license}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {LICENSE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality
            </label>
            <select
              name="quality"
              value={formData.quality}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {QUALITY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="nature, ambient, field-recording (comma separated)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate tags with commas (max 10 tags)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Equipment
          </label>
          <input
            type="text"
            name="equipment"
            value={formData.equipment}
            onChange={handleInputChange}
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Zoom H5, Rode NTG3"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Creating...' : 'Create Recording'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RecordingForm;
