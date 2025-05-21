import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-10 sm:pt-16 p-4">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-xl p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-text-primary">Votre Profil</h1>
        {user ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-text-secondary">Email</p>
              <p className="text-lg text-text-primary break-all">{user.email}</p>
            </div>
            <hr className="border-neutral" />
            <div>
              <p className="text-sm font-medium text-text-secondary">Rôle</p>
              <p className="text-lg text-text-primary capitalize">{user.role}</p>
            </div>
            {/* Ajouter d'autres informations ou actions ici si nécessaire */}
            {/* Exemple: Bouton pour modifier le profil ou le mot de passe */}
            {/* <button className="mt-6 w-full bg-secondary hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors duration-150">
              Modifier le profil (Fonctionnalité à venir)
            </button> */}
          </div>
        ) : (
          <p className="text-text-secondary text-center">Chargement des informations utilisateur...</p>
        )}
      </div>
    </div>
  );
};

export default Profile;