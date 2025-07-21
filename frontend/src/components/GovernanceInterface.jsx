import React, { useState, useEffect } from 'react';
import { Card, GlassCard } from './ui/Card';
import Button from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  HandRaisedIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const GovernanceInterface = () => {
  const { user, isAuthenticated } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    type: 'platform_parameter',
    options: ['For', 'Against'],
    votingPeriod: 7
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchProposals();
    }
  }, [isAuthenticated, activeTab]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/governance/proposals?status=${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProposals(data);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId, option) => {
    try {
      const response = await fetch(`/api/governance/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ option })
      });

      if (response.ok) {
        fetchProposals(); // Refresh proposals
        alert('Vote cast successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to cast vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to cast vote');
    }
  };

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/governance/proposals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProposal)
      });

      if (response.ok) {
        setShowCreateProposal(false);
        setNewProposal({
          title: '',
          description: '',
          type: 'platform_parameter',
          options: ['For', 'Against'],
          votingPeriod: 7
        });
        fetchProposals();
        alert('Proposal created successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create proposal');
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('Failed to create proposal');
    }
  };

  const getProposalTypeIcon = (type) => {
    switch (type) {
      case 'platform_parameter':
        return <Cog6ToothIcon className="w-6 h-6" />;
      case 'content_policy':
        return <DocumentTextIcon className="w-6 h-6" />;
      case 'community_guideline':
        return <UsersIcon className="w-6 h-6" />;
      case 'feature_request':
        return <ChartBarIcon className="w-6 h-6" />;
      default:
        return <DocumentTextIcon className="w-6 h-6" />;
    }
  };

  const getProposalTypeColor = (type) => {
    switch (type) {
      case 'platform_parameter':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'content_policy':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'community_guideline':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'feature_request':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const calculateVotePercentage = (votes, totalVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const canVote = (proposal) => {
    return proposal.status === 'active' && 
           new Date(proposal.endDate) > new Date() &&
           !proposal.userVote;
  };

  const ProposalCard = ({ proposal }) => (
    <GlassCard className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="text-blue-500">
            {getProposalTypeIcon(proposal.type)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {proposal.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 text-xs rounded-full ${getProposalTypeColor(proposal.type)}`}>
                {proposal.type.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                by {proposal.creator?.username || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {proposal.totalVotes} votes
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ends {new Date(proposal.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300">{proposal.description}</p>

      {/* Vote Options */}
      <div className="space-y-3">
        {proposal.options?.map((option, index) => {
          const votes = proposal.voteCounts?.[index] || 0;
          const percentage = calculateVotePercentage(votes, proposal.totalVotes);
          const isUserChoice = proposal.userVote === index;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{option}</span>
                  {isUserChoice && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {votes} votes ({percentage}%)
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    index === 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              {/* Vote Button */}
              {canVote(proposal) && (
                <Button
                  onClick={() => handleVote(proposal.id, index)}
                  variant={index === 0 ? "solid" : "outline"}
                  size="sm"
                  className="w-full"
                >
                  <HandRaisedIcon className="w-4 h-4 mr-1" />
                  Vote {option}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Messages */}
      {proposal.status === 'passed' && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircleIcon className="w-5 h-5 text-green-500" />
          <span className="text-green-700 dark:text-green-300 font-medium">Proposal Passed</span>
        </div>
      )}
      
      {proposal.status === 'rejected' && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <XCircleIcon className="w-5 h-5 text-red-500" />
          <span className="text-red-700 dark:text-red-300 font-medium">Proposal Rejected</span>
        </div>
      )}
      
      {proposal.userVote !== undefined && proposal.status === 'active' && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <CheckCircleIcon className="w-5 h-5 text-blue-500" />
          <span className="text-blue-700 dark:text-blue-300 font-medium">
            You voted: {proposal.options[proposal.userVote]}
          </span>
        </div>
      )}
    </GlassCard>
  );

  if (!isAuthenticated) {
    return (
      <GlassCard className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Please log in to participate in governance
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Platform Governance
        </h2>
        {user?.reputation >= 500 && (
          <Button
            onClick={() => setShowCreateProposal(true)}
            variant="solid"
          >
            Create Proposal
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {['active', 'passed', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} Proposals
          </button>
        ))}
      </div>

      {/* Proposals List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading proposals...</span>
        </div>
      ) : proposals.length > 0 ? (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      ) : (
        <GlassCard className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No {activeTab} proposals found
          </p>
        </GlassCard>
      )}

      {/* Create Proposal Modal */}
      {showCreateProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Proposal
            </h3>
            
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={newProposal.type}
                  onChange={(e) => setNewProposal({ ...newProposal, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="platform_parameter">Platform Parameter</option>
                  <option value="content_policy">Content Policy</option>
                  <option value="community_guideline">Community Guideline</option>
                  <option value="feature_request">Feature Request</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Voting Period (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newProposal.votingPeriod}
                  onChange={(e) => setNewProposal({ ...newProposal, votingPeriod: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateProposal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="solid"
                  className="flex-1"
                >
                  Create Proposal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernanceInterface;