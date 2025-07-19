import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

// Configure l'URL de base pour les requêtes Axios
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || '/api';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);