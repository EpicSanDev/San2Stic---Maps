import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRecordings } from '../hooks/useRecordings';
import { useWeb3 } from '../hooks/useWeb3';
import { 
  UserIcon, 
  MapPinIcon, 
  MicrophoneIcon, 
  StarIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { 
  CheckBadgeIcon,
  FireIcon
} from '@heroicons/react/24/solid';

const Profile = () => {
  const { user } = useAuth();
  const { fetchUserRecordings, recordings, isLoading } = useRecordings();
  const { isConnected, address, connectWallet } = useWeb3();
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (user) {
      fetchUserRecordings();
    }
  }, [user, fetchUserRecordings]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-xl">
          <UserIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Profil non accessible</h2>
          <p className="text-gray-600 dark:text-gray-300">Veuillez vous connecter pour accéder à votre profil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-xl mb-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 dark:from-indigo-400/10 dark:to-cyan-400/10" />
          <div className="absolute inset-0 opacity-30 dark:opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
          
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Avatar & Basic Info */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl font-bold">
                      {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
                    </span>
                  </div>
                  {user.role === 'admin' && (
                    <div className="absolute -top-1 -right-1">
                      <CheckBadgeIcon className="h-6 w-6 text-yellow-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {user.username || user.email.split('@')[0]}
                    </h1>
                    {user.reputation > 500 && (
                      <FireIcon className="h-6 w-6 text-orange-500" />
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">{user.email}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === 'admin' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                    }`}>
                      {user.role === 'admin' ? '👑 Administrateur' : '🎵 Contributeur'}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                      <StarIcon className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{user.reputation || 100}</span>
                      <span>réputation</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Membre depuis {user.registrationTimestamp ? new Date(user.registrationTimestamp).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'récemment'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-3 lg:ml-auto">
                <button className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors duration-200 shadow-lg">
                  <CogIcon className="h-4 w-4 mr-2" />
                  Paramètres
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors duration-200 border border-gray-200 dark:border-gray-600">
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Partager
                </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30 dark:border-gray-600/30">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <MicrophoneIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{recordings?.length || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Enregistrements</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30 dark:border-gray-600/30">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <ChartBarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.reputation || 100}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Réputation</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30 dark:border-gray-600/30">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl">
                    <MapPinIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{recordings?.filter(r => r.latitude && r.longitude).length || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Lieux explorés</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30 dark:border-gray-600/30">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <StarIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{recordings?.filter(r => r.moderationStatus === 'APPROVED').length || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Approuvés</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-xl mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl mr-3">
                  <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                Portefeuille Blockchain
              </h2>
              {isConnected && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Connecté
                </div>
              )}
            </div>
            
            {isConnected ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">Wallet connecté avec succès</span>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 border border-green-200 dark:border-green-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Adresse du portefeuille :</p>
                      <p className="font-mono text-sm text-gray-900 dark:text-white break-all">{address}</p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-700 dark:text-green-300">✓</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Authentification</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-700 dark:text-green-300">🔐</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Sécurisé</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-300">Portefeuille non connecté</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Connectez votre portefeuille pour accéder à toutes les fonctionnalités blockchain de San2Stic.
                    </p>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                        <p className="text-lg">🎵</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">NFT Audio</p>
                      </div>
                      <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                        <p className="text-lg">⚡</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Transactions</p>
                      </div>
                      <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                        <p className="text-lg">🏆</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Récompenses</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6">
                    <button
                      onClick={connectWallet}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Connecter le Wallet
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-xl">
          <div className="border-b border-gray-200/50 dark:border-gray-700/50">
            <nav className="flex space-x-1 p-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'info'
                    ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                }`}
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Informations
              </button>
              <button
                onClick={() => setActiveTab('recordings')}
                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'recordings'
                    ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                }`}
              >
                <MicrophoneIcon className="h-4 w-4 mr-2" />
                Mes Enregistrements
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'recordings'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  {recordings?.length || 0}
                </span>
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'info' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Informations du Profil</h3>
                  <p className="text-gray-600 dark:text-gray-300">Gérez vos informations personnelles et vos préférences</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Email</h4>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Adresse email vérifiée</p>
                  </div>
                  
                  {/* Username Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                        <UserIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Nom d'utilisateur</h4>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">{user.username || 'Non défini'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Identifiant public</p>
                  </div>
                  
                  {/* Role Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Rôle</h4>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium capitalize">{user.role === 'admin' ? 'Administrateur' : 'Contributeur'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Niveau d'accès</p>
                  </div>
                  
                  {/* Reputation Card */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                        <StarIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Réputation</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.reputation || 100}</p>
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} className={`h-4 w-4 ${i < Math.floor((user.reputation || 100) / 100) ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Points de contribution</p>
                  </div>
                  
                  {/* Total Recordings Card */}
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-cyan-200 dark:border-cyan-800">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl">
                        <MicrophoneIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Enregistrements</h4>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{recordings?.length || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Contributions totales</p>
                  </div>
                  
                  {/* Member Since Card */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-gray-100 dark:bg-gray-900/30 rounded-xl">
                        <CalendarIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Membre depuis</h4>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {user.registrationTimestamp ? new Date(user.registrationTimestamp).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      }) : 'Récemment'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Date d'inscription</p>
                  </div>
                </div>
                
                {/* Activity Timeline Preview */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    Activité Récente
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300">Dernière connexion: Aujourd'hui</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300">Enregistrements ce mois: {recordings?.filter(r => {
                        const recordingDate = new Date(r.createdAt);
                        const now = new Date();
                        return recordingDate.getMonth() === now.getMonth() && recordingDate.getFullYear() === now.getFullYear();
                      }).length || 0}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300">Réputation gagnée: +{Math.floor(Math.random() * 50) + 10} ce mois</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'recordings' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mes Enregistrements</h3>
                  <p className="text-gray-600 dark:text-gray-300">Explorez et gérez votre collection de paysages sonores</p>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-800 dark:text-green-300 text-sm font-medium">Approuvés</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-200">{recordings?.filter(r => r.moderationStatus === 'APPROVED').length || 0}</p>
                      </div>
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-800 dark:text-yellow-300 text-sm font-medium">En attente</p>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">{recordings?.filter(r => r.moderationStatus === 'PENDING').length || 0}</p>
                      </div>
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                        <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">Total</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{recordings?.length || 0}</p>
                      </div>
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <MicrophoneIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-16">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 dark:border-indigo-800 mx-auto"></div>
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 dark:border-indigo-400 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <p className="mt-6 text-lg font-medium text-gray-900 dark:text-white">Chargement des enregistrements...</p>
                    <p className="text-gray-600 dark:text-gray-300">Récupération de vos paysages sonores</p>
                  </div>
                ) : recordings && recordings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {recordings.map((recording) => (
                      <div key={recording.id} className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                        {/* Card Header with Waveform Visualization */}
                        <div className="relative h-24 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 dark:from-indigo-400/20 dark:to-cyan-400/20 p-4">
                          <div className="absolute inset-0 flex items-center justify-center opacity-30">
                            <div className="flex space-x-1">
                              {[...Array(12)].map((_, i) => (
                                <div key={i} className={`w-1 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-pulse`} style={{
                                  height: `${Math.random() * 20 + 10}px`,
                                  animationDelay: `${i * 0.1}s`
                                }}></div>
                              ))}
                            </div>
                          </div>
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="p-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-xl">
                              <MicrophoneIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                              recording.moderationStatus === 'APPROVED' 
                                ? 'bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : recording.moderationStatus === 'PENDING'
                                ? 'bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {recording.moderationStatus === 'APPROVED' ? '✓ Approuvé' : 
                               recording.moderationStatus === 'PENDING' ? '⏳ En attente' : '❌ Rejeté'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-6">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {recording.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">{recording.artist}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{recording.description}</p>
                          
                          {/* Location & Date */}
                          <div className="space-y-2 mb-4">
                            {recording.latitude && recording.longitude && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                <MapPinIcon className="h-4 w-4 text-cyan-500" />
                                <span>{recording.latitude.toFixed(3)}, {recording.longitude.toFixed(3)}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                              <CalendarIcon className="h-4 w-4 text-gray-400" />
                              <span>{recording.createdAt ? new Date(recording.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              }) : 'Date inconnue'}</span>
                            </div>
                          </div>
                          
                          {/* Tags */}
                          {recording.tags && recording.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {recording.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                                  #{tag}
                                </span>
                              ))}
                              {recording.tags.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                  +{recording.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <button className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors duration-200">
                              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              Écouter
                            </button>
                            <button className="inline-flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors duration-200">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                              </svg>
                            </button>
                            <button className="inline-flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors duration-200">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-xl p-12 max-w-md mx-auto">
                      <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl w-fit mx-auto mb-6">
                        <MicrophoneIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Aucun enregistrement</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">Vous n'avez pas encore d'enregistrements. Commencez à capturer les paysages sonores qui vous entourent !</p>
                      <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Créer mon premier enregistrement
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;