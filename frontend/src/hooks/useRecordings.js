import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useRecordings = () => {
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecordings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/recordings');
      setRecordings(response.data);
    } catch (err) {
      setError(err.response ? err.response.data : 'Erreur de récupération des enregistrements');
      console.error("Erreur lors de la récupération des enregistrements:", err);
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
      const response = await axios.post('/api/recordings', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' // Le navigateur le définit automatiquement pour FormData
        },
      });
      // Optionnel: rafraîchir la liste après un ajout réussi
      fetchRecordings();
      return response.data; // Retourne les données de la réponse en cas de succès
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data || 'Erreur lors de la création de l\'enregistrement';
      setError(errorMessage);
      console.error("Erreur lors de la création de l'enregistrement:", err);
      throw new Error(errorMessage); // Propage l'erreur pour la gestion dans le composant
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecordings]);

  return { recordings, isLoading, error, refetchRecordings: fetchRecordings, createRecording };
};

export default useRecordings;