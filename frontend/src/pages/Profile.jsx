import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRecordings } from '../hooks/useRecordings';
import { useWeb3 } from '../hooks/useWeb3';
import { 
  UserIcon, 
  MicrophoneIcon, 
  StarIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  ShareIcon,
  WalletIcon,
  BoltIcon,
  TrophyIcon,
  MusicalNoteIcon,
  PencilIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { 
  CheckBadgeIcon,
  FireIcon
} from '@heroicons/react/24/solid';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { GamificationDashboard } from '../components/GamificationDashboard';
import { AudioPlayer } from '../components/ui/AudioPlayer';
import { cn } from '../utils/cn';

const Profile = () => {
  const { user } = useAuth();
  const { fetchUserRecordings, recordings, isLoading } = useRecordings();
  const { isConnected, address, connectWallet } = useWeb3();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserRecordings();
    }
  }, [user, fetchUserRecordings]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/20 flex items-center justify-center p-4">
        <GlassCard className="text-center p-12">
          <UserIcon className="h-20 w-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Restricted</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
            Please sign in to access your profile and track your audio journey.
          </p>
          <Button variant="gradient" size="lg">
            Sign In to Continue
          </Button>
        </GlassCard>
      </div>
    );
  }

  // Mock user data with enhanced gamification stats
  const enhancedUser = {
    ...user,
    level: 5,
    currentXP: 350,
    nextLevelXP: 500,
    totalRecordings: recordings?.length || 12,
    totalLikes: recordings?.reduce((acc, r) => acc + (r.upvotes || 0), 0) || 67,
    totalPlays: recordings?.reduce((acc, r) => acc + (r.plays || 0), 0) || 1234,
    streak: 15,
    joinedAt: '2024-01-15',
    location: 'Paris, France',
    bio: 'Passionate field recording artist exploring urban and natural soundscapes.',
    verified: true,
    reputation: 4.8
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserIcon },
    { id: 'recordings', label: 'Recordings', icon: MusicalNoteIcon },
    { id: 'achievements', label: 'Achievements', icon: TrophyIcon },
    { id: 'settings', label: 'Settings', icon: CogIcon }
  ];

  const TabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* User Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassCard className="p-6 text-center">
                <MusicalNoteIcon className="w-10 h-10 mx-auto mb-3 text-primary-600" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {enhancedUser.totalRecordings}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Recordings</div>
              </GlassCard>

              <GlassCard className="p-6 text-center">
                <StarIcon className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {enhancedUser.totalLikes}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Likes</div>
              </GlassCard>

              <GlassCard className="p-6 text-center">
                <ChartBarIcon className="w-10 h-10 mx-auto mb-3 text-blue-500" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {enhancedUser.totalPlays.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Plays</div>
              </GlassCard>

              <GlassCard className="p-6 text-center">
                <FireIcon className="w-10 h-10 mx-auto mb-3 text-orange-500" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {enhancedUser.streak}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
              </GlassCard>
            </div>

            {/* Recent Activity */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recordings?.slice(0, 3).map((recording, index) => (
                  <div key={recording.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-electric-500 flex items-center justify-center">
                      <MusicalNoteIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {recording.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {recording.plays || 0} plays • {recording.upvotes || 0} likes
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(recording.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No recordings yet. Start creating to see your activity here!
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        );

      case 'recordings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Recordings ({recordings?.length || 0})
              </h3>
              <Button variant="gradient">
                <MicrophoneIcon className="w-5 h-5 mr-2" />
                Upload New
              </Button>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <GlassCard key={i} className="p-6 animate-pulse">
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </GlassCard>
                ))}
              </div>
            ) : recordings?.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recordings.map((recording) => (
                  <GlassCard key={recording.id} className="p-6 group hover:scale-105 transition-transform duration-300">
                    <div className="aspect-video bg-gradient-to-br from-primary-100 to-electric-100 dark:from-primary-900/30 dark:to-electric-900/30 rounded-xl mb-4 flex items-center justify-center">
                      <MusicalNoteIcon className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 truncate">
                      {recording.title}
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {recording.plays || 0} plays • {recording.upvotes || 0} likes
                    </div>
                    {recording.audioUrl && (
                      <AudioPlayer
                        src={recording.audioUrl}
                        title={recording.title}
                        artist={recording.artist}
                        compact={true}
                      />
                    )}
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="p-12 text-center">
                <MicrophoneIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No Recordings Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Start your audio journey by uploading your first field recording. Share your unique soundscapes with the community!
                </p>
                <Button variant="gradient" size="lg">
                  <MicrophoneIcon className="w-5 h-5 mr-2" />
                  Upload Your First Recording
                </Button>
              </GlassCard>
            )}
          </div>
        );

      case 'achievements':
        return (
          <GamificationDashboard 
            user={enhancedUser} 
            achievements={[]} 
            leaderboard={[]} 
          />
        );

      case 'settings':
        return (
          <div className="space-y-8">
            {/* Account Settings */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h3>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      defaultValue={user.username || user.email?.split('@')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      defaultValue={user.email}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    defaultValue={enhancedUser.bio}
                  />
                </div>

                <div className="flex justify-end">
                  <Button variant="gradient">
                    Save Changes
                  </Button>
                </div>
              </div>
            </GlassCard>

            {/* Blockchain Settings */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <WalletIcon className="w-6 h-6 mr-2 text-primary-600" />
                Blockchain Wallet
              </h3>
              
              {isConnected ? (
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <CheckBadgeIcon className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Wallet Connected
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <WalletIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    Connect Your Wallet
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Connect your blockchain wallet to access decentralized features and manage your digital assets.
                  </p>
                  <Button variant="gradient" onClick={connectWallet}>
                    Connect Wallet
                  </Button>
                </div>
              )}
            </GlassCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/20 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <GlassCard className="p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-600 via-electric-600 to-frequency-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                {enhancedUser.username?.charAt(0)?.toUpperCase() || enhancedUser.email?.charAt(0)?.toUpperCase()}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <CameraIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {enhancedUser.username || enhancedUser.email?.split('@')[0]}
                </h1>
                {enhancedUser.verified && (
                  <CheckBadgeIcon className="w-7 h-7 text-blue-500" />
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mb-4">
                <span className="flex items-center">
                  <BoltIcon className="w-4 h-4 mr-1" />
                  Level {enhancedUser.level}
                </span>
                <span className="flex items-center">
                  <StarIcon className="w-4 h-4 mr-1" />
                  {enhancedUser.reputation} rating
                </span>
                <span className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  Joined {new Date(enhancedUser.joinedAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl">
                {enhancedUser.bio}
              </p>

              <div className="flex items-center space-x-4">
                <Button 
                  variant="gradient" 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm">
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-primary-600 to-electric-600 text-white shadow-lg"
                    : "bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-md"
                )}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <TabContent />
      </div>
    </div>
  );
};

export default Profile;