import React, { useState, useEffect, useCallback } from 'react';
import {
  UserIcon,
  StarIcon,
  MapPinIcon,
  ChartBarIcon,
  TrophyIcon,
  HandThumbUpIcon,
  EyeIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { useWeb3 } from '../hooks/useWeb3';
import { web3Service } from '../utils/web3';

const LICENSE_LABELS = {
  0: 'Tous droits réservés',
  1: 'CC BY',
  2: 'CC BY-SA',
  3: 'CC BY-NC',
  4: 'CC BY-NC-SA',
  5: 'CC0',
  6: 'Domaine public'
};

const UserDashboard = ({ userAddress, onClose }) => {
  const [userDashboard, setUserDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const { address } = useWeb3();

  const fetchUserDashboard = useCallback(async () => {
    try {
      setLoading(true);
      if (web3Service.isConnected()) {
        const dashboard = await web3Service.contracts.san2sticMapMain.getUserDashboard(userAddress);
        setUserDashboard(dashboard);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement du tableau de bord');
      console.error('Error fetching user dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    if (userAddress) {
      fetchUserDashboard();
    }
  }, [userAddress, fetchUserDashboard]);

  if (!userAddress) return null;

  const isOwnProfile = userAddress.toLowerCase() === address?.toLowerCase();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isOwnProfile ? 'Mon Profil' : 'Profil Utilisateur'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
              <Button onClick={fetchUserDashboard} className="mt-4" size="sm">
                Réessayer
              </Button>
            </div>
          ) : userDashboard ? (
            <div className="p-6">
              {/* Navigation Tabs */}
              <div className="flex space-x-1 mb-6">
                {[
                  { id: 'overview', label: 'Vue d\'ensemble', icon: ChartBarIcon },
                  { id: 'recordings', label: 'Enregistrements', icon: MapPinIcon },
                  { id: 'stats', label: 'Statistiques', icon: TrophyIcon },
                  ...(isOwnProfile ? [{ id: 'settings', label: 'Paramètres', icon: CogIcon }] : [])
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTab === tab.id
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Overview Tab */}
              {selectedTab === 'overview' && (
                <div className="space-y-6">
                  {/* User Info Card */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <UserIcon className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {userDashboard.userInfo.username || 'Utilisateur anonyme'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Membre depuis {new Date(userDashboard.userInfo.registrationTimestamp * 1000).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className={`w-2 h-2 rounded-full ${
                              userDashboard.userInfo.isActive ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {userDashboard.userInfo.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Reputation */}
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <TrophyIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Réputation</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {userDashboard.userInfo.reputation}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Points de réputation gagnés
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <MapPinIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="text-xl font-semibold text-gray-900 dark:text-white">
                              {userDashboard.userInfo.totalRecordings}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Enregistrements</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <HandThumbUpIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <div className="text-xl font-semibold text-gray-900 dark:text-white">
                              {userDashboard.totalUpvotes}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Votes positifs</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <StarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <div className="text-xl font-semibold text-gray-900 dark:text-white">
                              {userDashboard.userInfo.totalVotes}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Votes émis</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Preferred Licenses */}
                  {userDashboard.preferredLicenses && userDashboard.preferredLicenses.length > 0 && (
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <ShieldCheckIcon className="h-5 w-5 mr-2" />
                          Licences préférées
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {userDashboard.preferredLicenses.map((licenseType, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            >
                              {LICENSE_LABELS[licenseType] || `License ${licenseType}`}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Recordings Tab */}
              {selectedTab === 'recordings' && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Enregistrements ({userDashboard.userRecordings?.length || 0})
                    </h3>
                    {userDashboard.userRecordings && userDashboard.userRecordings.length > 0 ? (
                      <div className="space-y-3">
                        {userDashboard.userRecordings.map((recordingId) => (
                          <div
                            key={recordingId}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                                <MapPinIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  Enregistrement #{recordingId}
                                </div>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <EyeIcon className="h-4 w-4 mr-1" />
                              Voir
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Aucun enregistrement trouvé
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Stats Tab */}
              {selectedTab === 'stats' && (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Statistiques détaillées
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {userDashboard.userInfo.id}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">ID Utilisateur</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {userDashboard.totalUpvotes}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Votes positifs reçus</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {userDashboard.totalRatings}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Évaluations reçues</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {userDashboard.userInfo.reputation}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Points de réputation</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Settings Tab (only for own profile) */}
              {selectedTab === 'settings' && isOwnProfile && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Paramètres du profil
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nom d'utilisateur
                        </label>
                        <input
                          type="text"
                          value={userDashboard.userInfo.username || ''}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Le nom d'utilisateur ne peut pas être modifié après l'enregistrement
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Adresse du portefeuille
                        </label>
                        <input
                          type="text"
                          value={userDashboard.userInfo.walletAddress}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;