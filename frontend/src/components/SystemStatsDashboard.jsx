import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  MapPinIcon,
  HandThumbUpIcon,
  StarIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { web3Service } from '../utils/web3';

const SystemStatsDashboard = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchSystemStats();
    }
  }, [isOpen]);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (web3Service.isConnected()) {
        const systemStats = await web3Service.contracts.san2sticMapMain.getSystemStats();
        setStats(systemStats);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des statistiques');
      console.error('Error fetching system stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Statistiques du système
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Vue d'ensemble de l'activité San2Stic Maps
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={fetchSystemStats} size="sm" variant="outline" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <>
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  Actualiser
                </>
              )}
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {loading && !stats ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Erreur de chargement
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={fetchSystemStats}>
                Réessayer
              </Button>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Last Updated */}
              {lastUpdated && (
                <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Dernière mise à jour: {lastUpdated.toLocaleString()}
                </div>
              )}

              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Users */}
                <Card className="transform hover:scale-105 transition-transform duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <UsersIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.totalUsers?.toString() || '0'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Utilisateurs inscrits
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Communauté active
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Recordings */}
                <Card className="transform hover:scale-105 transition-transform duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <MapPinIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.totalRecordings?.toString() || '0'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Enregistrements audio
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Contenu géolocalisé
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Votes */}
                <Card className="transform hover:scale-105 transition-transform duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <HandThumbUpIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.totalVotes?.toString() || '0'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Votes émis
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                        Engagement communautaire
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Ratings */}
                <Card className="transform hover:scale-105 transition-transform duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                        <StarIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.totalRatings?.toString() || '0'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Évaluations données
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                      <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                        Qualité du contenu
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Moderation Actions */}
                <Card className="transform hover:scale-105 transition-transform duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                        <ShieldCheckIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.totalModerationActions?.toString() || '0'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Actions de modération
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                      <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                        Sécurité de la plateforme
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Calculated Metrics */}
                <Card className="transform hover:scale-105 transition-transform duration-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          Métriques calculées
                        </div>
                      </div>

                      {/* Average recordings per user */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Enreg./utilisateur:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {stats.totalUsers > 0 
                            ? (Number(stats.totalRecordings) / Number(stats.totalUsers)).toFixed(1)
                            : '0.0'
                          }
                        </span>
                      </div>

                      {/* Average votes per recording */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Votes/enregistrement:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {stats.totalRecordings > 0 
                            ? (Number(stats.totalVotes) / Number(stats.totalRecordings)).toFixed(1)
                            : '0.0'
                          }
                        </span>
                      </div>

                      {/* Average ratings per recording */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Notes/enregistrement:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {stats.totalRecordings > 0 
                            ? (Number(stats.totalRatings) / Number(stats.totalRecordings)).toFixed(1)
                            : '0.0'
                          }
                        </span>
                      </div>

                      {/* Moderation rate */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Taux de modération:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {stats.totalRecordings > 0 
                            ? ((Number(stats.totalModerationActions) / Number(stats.totalRecordings)) * 100).toFixed(1) + '%'
                            : '0.0%'
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Health Indicators */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                    Indicateurs de santé de la plateforme
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Activity Level */}
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Niveau d'activité
                      </div>
                      <div className={`text-xl font-bold ${
                        Number(stats.totalRecordings) > 100 ? 'text-green-600' :
                        Number(stats.totalRecordings) > 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Number(stats.totalRecordings) > 100 ? 'Élevé' :
                         Number(stats.totalRecordings) > 50 ? 'Moyen' : 'Faible'}
                      </div>
                    </div>

                    {/* Community Engagement */}
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Engagement
                      </div>
                      <div className={`text-xl font-bold ${
                        Number(stats.totalVotes) > Number(stats.totalRecordings) ? 'text-green-600' :
                        Number(stats.totalVotes) > Number(stats.totalRecordings) * 0.5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Number(stats.totalVotes) > Number(stats.totalRecordings) ? 'Excellent' :
                         Number(stats.totalVotes) > Number(stats.totalRecordings) * 0.5 ? 'Bon' : 'À améliorer'}
                      </div>
                    </div>

                    {/* Content Quality */}
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Qualité du contenu
                      </div>
                      <div className={`text-xl font-bold ${
                        Number(stats.totalModerationActions) < Number(stats.totalRecordings) * 0.1 ? 'text-green-600' :
                        Number(stats.totalModerationActions) < Number(stats.totalRecordings) * 0.2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Number(stats.totalModerationActions) < Number(stats.totalRecordings) * 0.1 ? 'Excellente' :
                         Number(stats.totalModerationActions) < Number(stats.totalRecordings) * 0.2 ? 'Bonne' : 'Préoccupante'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Growth */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    État de la plateforme
                  </h3>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        San2Stic Maps est une plateforme décentralisée pour partager des enregistrements audio géolocalisés
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Alimenté par Ethereum et stocké sur IPFS • Open Source • Gouvernance communautaire
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SystemStatsDashboard;