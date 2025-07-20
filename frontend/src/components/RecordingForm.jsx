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
    <div className="max-w-2xl mx-auto bg-gray-800 text-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Add New Recording</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-500 border border-red-700 rounded-lg text-white">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Recording title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Artist *
            </label>
            <input
              type="text"
              name="artist"
              value={formData.artist}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Artist name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            maxLength={500}
            rows={4}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="A brief description of your recording..."
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Latitude *
            </label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 48.8566"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Longitude *
            </label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 2.3522"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="useCurrentLocation"
            checked={useCurrentLocation}
            onChange={(e) => {
              setUseCurrentLocation(e.target.checked);
              if (e.target.checked) {
                getCurrentLocation();
              }
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="useCurrentLocation" className="ml-2 block text-sm text-gray-300">
            Use my current location
          </label>
          {locationLoading && <div className="ml-4 text-sm text-blue-400">Getting location...</div>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., nature, forest, birds"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Equipment
            </label>
            <input
              type="text"
              name="equipment"
              value={formData.equipment}
              onChange={handleInputChange}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Zoom H4n"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              License
            </label>
            <select
              name="license"
              value={formData.license}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {LICENSE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Audio File *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-400">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-blue-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">MP3, WAV, OGG, MP4 up to 50MB</p>
            </div>
          </div>
          {audioFile && <p className="mt-2 text-sm text-gray-400">Selected: {audioFile.name}</p>}
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-600 rounded-lg text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Submit Recording'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordingForm;
