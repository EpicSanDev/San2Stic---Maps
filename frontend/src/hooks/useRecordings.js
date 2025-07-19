import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useRecordings = () => {
  const [recordings, setRecordings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecordings = useCallback(async (page = 1, limit = 50, status = 'APPROVED') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/recordings', {
        params: { page, limit, status }
      });
      
      if (response.data.recordings) {
        setRecordings(response.data.recordings);
        setTotalCount(response.data.totalCount);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
      } else {
        setRecordings(response.data);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error fetching recordings';
      setError(errorMessage);
      console.error("Error fetching recordings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRecordingsByLocation = useCallback(async (bounds, page = 1, limit = 50) => {
    setIsLoading(true);
    setError(null);
    try {
      const { minLat, maxLat, minLng, maxLng } = bounds;
      const response = await axios.get('/recordings/location', {
        params: { minLat, maxLat, minLng, maxLng, page, limit }
      });
      
      setRecordings(response.data.recordings);
      setTotalCount(response.data.totalCount);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error fetching recordings by location';
      setError(errorMessage);
      console.error("Error fetching recordings by location:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserRecordings = useCallback(async (page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/recordings/user', {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setRecordings(response.data.recordings);
      setTotalCount(response.data.totalCount);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error fetching user recordings';
      setError(errorMessage);
      console.error("Error fetching user recordings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  const createRecording = useCallback(async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/recordings', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      fetchRecordings();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error creating recording';
      setError(errorMessage);
      console.error("Error creating recording:", err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecordings]);

  const updateRecording = useCallback(async (recordingId, updateData) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/recordings/${recordingId}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      fetchRecordings();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error updating recording';
      setError(errorMessage);
      console.error("Error updating recording:", err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecordings]);

  const deleteRecording = useCallback(async (recordingId) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/recordings/${recordingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      fetchRecordings();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error deleting recording';
      setError(errorMessage);
      console.error("Error deleting recording:", err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecordings]);

  return { 
    recordings, 
    totalCount,
    currentPage,
    totalPages,
    isLoading, 
    error, 
    fetchRecordings,
    fetchRecordingsByLocation,
    fetchUserRecordings,
    createRecording,
    updateRecording,
    deleteRecording,
    setError
  };
};
