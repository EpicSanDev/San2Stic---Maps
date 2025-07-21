import React, { useState, useEffect, useCallback } from 'react';
import { 
  XMarkIcon, 
  PlayIcon, 
  PauseIcon, 
  HandThumbUpIcon, 
  HandThumbDownIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  SpeakerWaveIcon,
  TagIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { useWeb3 } from '../hooks/useWeb3';
import { web3Service } from '../utils/web3';

const QUALITY_LABELS = {
  0: 'Faible',
  1: 'Moyenne', 
  2: 'Haute',
  3: 'Sans perte'
};

const LICENSE_LABELS = {
  0: 'Tous droits réservés',
  1: 'CC BY',
  2: 'CC BY-SA', 
  3: 'CC BY-NC',
  4: 'CC BY-NC-SA',
  5: 'CC0',
  6: 'Domaine public'
};


const RecordingDetailsModal = ({ recording, isOpen, onClose, onVote, onRate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recordingDetails, setRecordingDetails] = useState(null);
  const { isConnected, address } = useWeb3();

  const fetchFullRecordingDetails = useCallback(async () => {
    try {
      setLoading(true);
      if (web3Service.isConnected()) {
        // Get full recording data from the contract
        const details = await web3Service.contracts.san2sticMapMain.getRecordingWithAllData(recording.id);
        setRecordingDetails(details);
      }
    } catch (error) {
      console.error('Error fetching recording details:', error);
    } finally {
      setLoading(false);
    }
  }, [recording]);

  useEffect(() => {
    if (isOpen && recording) {
      fetchFullRecordingDetails();
    }
  }, [isOpen, recording, fetchFullRecordingDetails]);

  const handleVote = async (isUpvote) => {
    try {
      await onVote(recording.id, isUpvote, recording.creator);
      // Refresh details after voting
      await fetchFullRecordingDetails();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleRate = async () => {
    if (currentRating > 0) {
      try {
        await onRate(recording.id, currentRating);
        // Refresh details after rating
        await fetchFullRecordingDetails();
        setCurrentRating(0);
      } catch (error) {
        console.error('Error rating:', error);
      }
    }
  };

  if (!isOpen || !recording) return null;

  const details = recordingDetails || {};
  const metadata = details.metadata || {};
  const stats = details.stats || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {metadata.title || recording.title || 'Enregistrement'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Audio Player */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-3 rounded-full"
                    >
                      {isPlaying ? (
                        <PauseIcon className="h-6 w-6" />
                      ) : (
                        <PlayIcon className="h-6 w-6" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {metadata.title || 'Enregistrement audio'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {metadata.duration ? `${Math.floor(metadata.duration / 60)}:${String(metadata.duration % 60).padStart(2, '0')}` : 'Durée inconnue'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recording Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Informations</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Créateur: {recording.creator?.slice(0, 8)}...
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        Lat: {(recording.latitude / 1000000).toFixed(6)}, 
                        Lng: {(recording.longitude / 1000000).toFixed(6)}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {new Date(recording.timestamp * 1000).toLocaleDateString()}
                      </div>
                      {metadata.quality !== undefined && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <SpeakerWaveIcon className="h-4 w-4 mr-2" />
                          Qualité: {QUALITY_LABELS[metadata.quality]}
                        </div>
                      )}
                      {metadata.equipment && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <SpeakerWaveIcon className="h-4 w-4 mr-2" />
                          Équipement: {metadata.equipment}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Statistiques</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Votes positifs:</span>
                        <span className="text-green-600 font-medium">{stats.upvotes || details.upvotes || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Votes négatifs:</span>
                        <span className="text-red-600 font-medium">{stats.downvotes || details.downvotes || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Note moyenne:</span>
                        <span className="text-yellow-600 font-medium">
                          {details.averageRating ? (details.averageRating / 100).toFixed(1) + '/5' : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Nb. d'évaluations:</span>
                        <span className="font-medium">{stats.ratingCount || details.ratingCount || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              {metadata.description && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{metadata.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {metadata.tags && metadata.tags.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {metadata.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          <TagIcon className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* License */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Licence</h3>
                  <div className="flex items-center text-sm">
                    <ShieldCheckIcon className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {LICENSE_LABELS[details.licenseType] || LICENSE_LABELS[metadata.license] || 'Non spécifiée'}
                    </span>
                  </div>
                  {details.attribution && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Attribution: {details.attribution}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              {isConnected && address !== recording.creator && (
                <div className="flex flex-wrap gap-4">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleVote(true)}
                      variant="outline"
                      className="flex items-center space-x-1"
                    >
                      <HandThumbUpIcon className="h-4 w-4" />
                      <span>J'aime</span>
                    </Button>
                    <Button
                      onClick={() => handleVote(false)}
                      variant="outline"
                      className="flex items-center space-x-1"
                    >
                      <HandThumbDownIcon className="h-4 w-4" />
                      <span>Je n'aime pas</span>
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Noter:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setCurrentRating(star)}
                        className={`p-1 ${
                          star <= currentRating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        <StarIcon className="h-4 w-4" />
                      </button>
                    ))}
                    {currentRating > 0 && (
                      <Button onClick={handleRate} size="sm">
                        Noter
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordingDetailsModal;