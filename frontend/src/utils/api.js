import axios from 'axios';
import { isOnline, queueOfflineAction } from './serviceWorker';

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

// Handle auth errors and offline scenarios
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

// Wrapper for API calls with offline support
const apiCallWithOfflineSupport = async (apiCall, offlineAction = null) => {
  if (!isOnline() && offlineAction) {
    // Queue action for when back online
    queueOfflineAction(offlineAction);
    return { message: 'Action queued for when back online', offline: true };
  }
  
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    if (!isOnline() && offlineAction) {
      queueOfflineAction(offlineAction);
      return { message: 'Action queued for when back online', offline: true };
    }
    throw error;
  }
};

// Social API functions
export const socialAPI = {
  // Rating functions
  rateRecording: async (recordingId, rating) => {
    return apiCallWithOfflineSupport(
      async () => {
        const response = await api.post(`/social/recordings/${recordingId}/rate`, { rating });
        return response.data;
      },
      {
        type: 'RATE_RECORDING',
        recordingId,
        rating
      }
    );
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
    return apiCallWithOfflineSupport(
      async () => {
        const response = await api.post(`/social/recordings/${recordingId}/like`);
        return response.data;
      },
      {
        type: 'LIKE_RECORDING',
        recordingId,
        isLiked: false
      }
    );
  },

  unlikeRecording: async (recordingId) => {
    return apiCallWithOfflineSupport(
      async () => {
        const response = await api.delete(`/social/recordings/${recordingId}/like`);
        return response.data;
      },
      {
        type: 'LIKE_RECORDING',
        recordingId,
        isLiked: true
      }
    );
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

// Recordings API functions
export const recordingsAPI = {
  // Get all recordings with basic pagination
  getAllRecordings: async (page = 1, limit = 50, status = 'APPROVED') => {
    try {
      const response = await api.get('/recordings', {
        params: { page, limit, status }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recordings');
    }
  },

  // Advanced search with filters
  searchRecordings: async (filters = {}) => {
    try {
      const response = await api.get('/recordings/search', {
        params: filters
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search recordings');
    }
  },

  // Get recordings by location
  getRecordingsByLocation: async (bounds, page = 1, limit = 50) => {
    try {
      const response = await api.get('/recordings/location', {
        params: {
          minLat: bounds.minLat,
          maxLat: bounds.maxLat,
          minLng: bounds.minLng,
          maxLng: bounds.maxLng,
          page,
          limit
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recordings by location');
    }
  },

  // Get user's recordings
  getUserRecordings: async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/recordings/user', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user recordings');
    }
  },
};

export default api;