import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import RadioPage from './pages/RadioPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Upload from './pages/Upload';
import { AudioUploader } from './components/AudioUploader';

function App() {
  const [uploadResult, setUploadResult] = useState(null);

  const handleUploadComplete = (result) => {
    setUploadResult(result);
    // TODO: Ajouter à la carte avec les coordonnées
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/radio" element={<RadioPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/upload" element={<Upload />} />
          </Routes>
        </main>
      </Router>
      <AudioUploader onUploadComplete={handleUploadComplete} />
      
      {uploadResult && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <h3>Upload réussi!</h3>
          <p>Hash IPFS: {uploadResult.ipfsHash}</p>
          <a href={uploadResult.ipfsUrl} target="_blank" rel="noreferrer">
            Voir sur IPFS
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
