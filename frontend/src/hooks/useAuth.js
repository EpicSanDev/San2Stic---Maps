import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Optionnel : Valider le token avec le backend ici
      // et récupérer les informations utilisateur si le token est valide.
      // Pour l'instant, on suppose que si le token est là, l'utilisateur est "connecté".
      // Si vous avez un endpoint /api/auth/me ou /api/user/profile, utilisez-le.
    }
  }, []);

  const storeAuthData = useCallback((userData, authToken) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    setError(null);
  }, []);

  const signup = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/signup', { email, password });
      if (response.data && response.data.token && response.data.user) {
        storeAuthData(response.data.user, response.data.token);
        return true;
      }
      // Gérer le cas où la réponse ne contient pas le token ou l'utilisateur attendu
      setError('Réponse invalide du serveur après inscription.');
      return false;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data && response.data.token && response.data.user) {
        storeAuthData(response.data.user, response.data.token);
        return true;
      }
      setError('Réponse invalide du serveur après connexion.');
      return false;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
    // Optionnel: Informer le backend de la déconnexion
  }, []);

  return { user, token, login, logout, signup, error, loading, setError };
};