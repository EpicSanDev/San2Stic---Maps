import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Social API functions
export const socialAPI = {
  // Rating functions
  rateRecording: async (recordingId, rating) => {
    try {
      const response = await api.post(`/social/recordings/${recordingId}/rate`, { rating });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to rate recording');
    }
  },

  getRating: async (recordingId) => {
    try {
      const response = await api.get(`/social/recordings/${recordingId}/rating`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get rating');
    }
  },

  removeRating: async (recordingId) => {
    try {
      const response = await api.delete(`/social/recordings/${recordingId}/rate`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove rating');
    }
  },

  // Like functions
  likeRecording: async (recordingId) => {
    try {
      const response = await api.post(`/social/recordings/${recordingId}/like`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to like recording');
    }
  },

  unlikeRecording: async (recordingId) => {
    try {
      const response = await api.delete(`/social/recordings/${recordingId}/like`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unlike recording');
    }
  },

  // Social data
  getSocialData: async (recordingId) => {
    try {
      const response = await api.get(`/social/recordings/${recordingId}/social`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get social data');
    }
  },

  // Bookmark functions
  bookmarkRecording: async (recordingId) => {
    try {
      const response = await api.post(`/social/recordings/${recordingId}/bookmark`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to bookmark recording');
    }
  },

  removeBookmark: async (recordingId) => {
    try {
      const response = await api.delete(`/social/recordings/${recordingId}/bookmark`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove bookmark');
    }
  },

  // Share function
  shareRecording: async (recordingId, platform = 'web') => {
    try {
      const response = await api.post(`/social/recordings/${recordingId}/share`, { platform });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to share recording');
    }
  },
};

export default api;