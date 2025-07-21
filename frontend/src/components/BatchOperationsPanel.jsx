import React, { useState } from 'react';
import {
  CheckIcon,
  XMarkIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  StarIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { useWeb3 } from '../hooks/useWeb3';
import { web3Service } from '../utils/web3';

const LICENSE_OPTIONS = [
  { value: 0, label: 'Tous droits réservés' },
  { value: 1, label: 'CC BY' },
  { value: 2, label: 'CC BY-SA' },
  { value: 3, label: 'CC BY-NC' },
  { value: 4, label: 'CC BY-NC-SA' },
  { value: 5, label: 'CC0' },
  { value: 6, label: 'Domaine public' }
];

const BatchOperationsPanel = ({ recordings, onClose, onOperationComplete }) => {
  const [selectedRecordings, setSelectedRecordings] = useState(new Set());
  const [operation, setOperation] = useState('vote'); // 'vote', 'rate', 'license'
  const [batchVoteType, setBatchVoteType] = useState(true); // true for upvote, false for downvote
  const [batchRating, setBatchRating] = useState(5);
  const [batchLicense, setBatchLicense] = useState(1);
  const [batchAttribution, setBatchAttribution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isConnected, address } = useWeb3();

  const toggleRecordingSelection = (recordingId) => {
    const newSelection = new Set(selectedRecordings);
    if (newSelection.has(recordingId)) {
      newSelection.delete(recordingId);
    } else {
      newSelection.add(recordingId);
    }
    setSelectedRecordings(newSelection);
  };

  const selectAll = () => {
    const eligibleRecordings = recordings.filter(r => r.creator !== address);
    setSelectedRecordings(new Set(eligibleRecordings.map(r => r.id)));
  };

  const clearSelection = () => {
    setSelectedRecordings(new Set());
  };

  const executeBatchOperation = async () => {
    if (selectedRecordings.size === 0) return;

    setLoading(true);
    setError(null);

    try {
      const recordingIds = Array.from(selectedRecordings);
      
      switch (operation) {
        case 'vote':
          const voteTypes = recordingIds.map(() => batchVoteType);
          await web3Service.contracts.san2sticMapMain.batchVoteOnRecordings(recordingIds, voteTypes);
          break;

        case 'rate':
          const ratings = recordingIds.map(() => batchRating);
          await web3Service.contracts.san2sticMapMain.batchRateRecordings(recordingIds, ratings);
          break;

        case 'license':
          // Note: This would typically be restricted to the creator or moderators
          const licenses = recordingIds.map(() => batchLicense);
          const attributions = recordingIds.map(() => batchAttribution);
          await web3Service.contracts.san2sticMapMain.batchSetRecordingLicenses(
            recordingIds, 
            licenses, 
            attributions
          );
          break;

        default:
          throw new Error('Opération non reconnue');
      }

      onOperationComplete?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'opération batch');
      console.error('Batch operation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter out recordings created by the current user for vote/rate operations
  const eligibleRecordings = operation === 'license' 
    ? recordings.filter(r => r.creator === address) // Only own recordings for license changes
    : recordings.filter(r => r.creator !== address); // Can't vote/rate own recordings

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <BoltIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Opérations en lot
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Operation Type Selection */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Type d'opération
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setOperation('vote')}
                  variant={operation === 'vote' ? 'default' : 'outline'}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <HandThumbUpIcon className="h-4 w-4" />
                  <span>Voter</span>
                </Button>
                <Button
                  onClick={() => setOperation('rate')}
                  variant={operation === 'rate' ? 'default' : 'outline'}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <StarIcon className="h-4 w-4" />
                  <span>Noter</span>
                </Button>
                <Button
                  onClick={() => setOperation('license')}
                  variant={operation === 'license' ? 'default' : 'outline'}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>Licence</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Operation Parameters */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Paramètres
              </h3>
              
              {operation === 'vote' && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setBatchVoteType(true)}
                    variant={batchVoteType ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <HandThumbUpIcon className="h-4 w-4" />
                    <span>Vote positif</span>
                  </Button>
                  <Button
                    onClick={() => setBatchVoteType(false)}
                    variant={!batchVoteType ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <HandThumbDownIcon className="h-4 w-4" />
                    <span>Vote négatif</span>
                  </Button>
                </div>
              )}

              {operation === 'rate' && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Note:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setBatchRating(star)}
                        className={`p-1 ${
                          star <= batchRating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        <StarIcon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {batchRating}/5
                  </span>
                </div>
              )}

              {operation === 'license' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type de licence
                    </label>
                    <select
                      value={batchLicense}
                      onChange={(e) => setBatchLicense(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {LICENSE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Attribution (optionnel)
                    </label>
                    <input
                      type="text"
                      value={batchAttribution}
                      onChange={(e) => setBatchAttribution(e.target.value)}
                      placeholder="Ex: Photo par John Doe"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recording Selection */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Sélectionner les enregistrements ({selectedRecordings.size} sélectionnés)
                </h3>
                <div className="flex space-x-2">
                  <Button onClick={selectAll} size="sm" variant="outline">
                    Tout sélectionner
                  </Button>
                  <Button onClick={clearSelection} size="sm" variant="outline">
                    Désélectionner
                  </Button>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {eligibleRecordings.map((recording) => (
                  <div
                    key={recording.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRecordings.has(recording.id)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    onClick={() => toggleRecordingSelection(recording.id)}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedRecordings.has(recording.id)
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedRecordings.has(recording.id) && (
                        <CheckIcon className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {recording.title || `Enregistrement #${recording.id}`}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Par {recording.creator?.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {eligibleRecordings.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {operation === 'license' 
                    ? 'Aucun de vos enregistrements disponible'
                    : 'Aucun enregistrement éligible disponible'
                  }
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={onClose} variant="outline">
              Annuler
            </Button>
            <Button
              onClick={executeBatchOperation}
              disabled={selectedRecordings.size === 0 || loading || !isConnected}
              className="flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>
                Exécuter ({selectedRecordings.size} éléments)
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchOperationsPanel;