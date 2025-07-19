import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RecordingForm from '../components/RecordingForm';

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Télécharger un nouvel enregistrement</h1>
      <RecordingForm 
        onSuccess={() => navigate('/profile')} 
        onCancel={() => navigate('/map')} 
      />
    </div>
  );
};

export default Upload;