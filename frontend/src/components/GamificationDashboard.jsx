import React, { useState, useEffect } from 'react';
import { 
  TrophyIcon, 
  StarIcon, 
  FireIcon, 
  BoltIcon,
  MusicalNoteIcon,
  MapPinIcon,
  HeartIcon,
  EyeIcon,
  ChartBarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { 
  TrophyIcon as TrophyIconSolid,
  StarIcon as StarIconSolid,
  FireIcon as FireIconSolid,
  BoltIcon as BoltIconSolid
} from '@heroicons/react/24/solid';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

const Achievement = ({ 
  id, 
  title, 
  description, 
  icon, 
  rarity = 'common', 
  progress = 0, 
  maxProgress = 100,
  unlocked = false,
  unlockedAt = null,
  points = 10
}) => {
  const rarityConfig = {
    common: {
      gradient: 'from-gray-400 to-gray-600',
      bg: 'bg-gray-100 dark:bg-gray-800',
      border: 'border-gray-300 dark:border-gray-700',
      glow: 'shadow-gray-500/20'
    },
    rare: {
      gradient: 'from-blue-400 to-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-blue-300 dark:border-blue-700',
      glow: 'shadow-blue-500/30'
    },
    epic: {
      gradient: 'from-purple-400 to-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      border: 'border-purple-300 dark:border-purple-700',
      glow: 'shadow-purple-500/30'
    },
    legendary: {
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      bg: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30',
      border: 'border-yellow-300 dark:border-yellow-700',
      glow: 'shadow-yellow-500/40'
    }
  };

  const config = rarityConfig[rarity];
  const progressPercent = (progress / maxProgress) * 100;

  return (
    <GlassCard 
      className={cn(
        "p-6 transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden",
        unlocked ? config.glow : 'opacity-60',
        config.border
      )}
    >
      {/* Rarity indicator */}
      <div className={cn(
        "absolute top-0 right-0 w-16 h-16 transform rotate-45 translate-x-6 -translate-y-6",
        config.bg
      )} />
      
      {/* Achievement icon */}
      <div className={cn(
        "w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-white relative",
        unlocked ? `bg-gradient-to-br ${config.gradient}` : 'bg-gray-400'
      )}>
        {unlocked && rarity === 'legendary' && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 opacity-30 animate-pulse" />
        )}
        <div className="relative z-10">
          {icon}
        </div>
      </div>

      {/* Achievement details */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className={cn(
            "font-bold text-lg",
            unlocked ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
          )}>
            {title}
          </h3>
          <div className="flex items-center space-x-1">
            <StarIconSolid className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              {points}
            </span>
          </div>
        </div>
        
        <p className={cn(
          "text-sm leading-relaxed",
          unlocked ? "text-gray-600 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
        )}>
          {description}
        </p>
      </div>

      {/* Progress bar */}
      {!unlocked && maxProgress > 1 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{progress}/{maxProgress}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                `bg-gradient-to-r ${config.gradient}`
              )}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Unlock date */}
      {unlocked && unlockedAt && (
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <CalendarDaysIcon className="w-3 h-3 mr-1" />
          Unlocked {new Date(unlockedAt).toLocaleDateString()}
        </div>
      )}

      {/* Rarity badge */}
      <div className={cn(
        "absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium capitalize",
        config.bg,
        unlocked ? "text-gray-700 dark:text-gray-300" : "text-gray-500"
      )}>
        {rarity}
      </div>
    </GlassCard>
  );
};

const ReputationCard = ({ 
  level = 1, 
  currentXP = 0, 
  nextLevelXP = 100, 
  totalRecordings = 0,
  totalLikes = 0,
  totalPlays = 0,
  streak = 0 
}) => {
  const xpProgress = (currentXP / nextLevelXP) * 100;

  const levelTitles = {
    1: 'Sound Explorer',
    5: 'Audio Enthusiast', 
    10: 'Field Recorder',
    20: 'Sound Artist',
    50: 'Audio Master',
    100: 'Sonic Legend'
  };

  const getCurrentTitle = (level) => {
    const levels = Object.keys(levelTitles).map(Number).sort((a, b) => b - a);
    for (const lvl of levels) {
      if (level >= lvl) return levelTitles[lvl];
    }
    return levelTitles[1];
  };

  return (
    <GlassCard className="p-6 bg-gradient-to-br from-primary-50/80 to-electric-50/80 dark:from-primary-900/20 dark:to-electric-900/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Level {level}
          </h2>
          <p className="text-primary-600 dark:text-primary-400 font-medium">
            {getCurrentTitle(level)}
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-electric-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {level}
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Experience Points</span>
          <span>{currentXP}/{nextLevelXP} XP</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="h-3 rounded-full bg-gradient-to-r from-primary-600 to-electric-600 transition-all duration-700"
            style={{ width: `${Math.min(xpProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
          <MusicalNoteIcon className="w-6 h-6 mx-auto mb-2 text-primary-600" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalRecordings}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Recordings</div>
        </div>
        
        <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
          <HeartIcon className="w-6 h-6 mx-auto mb-2 text-red-500" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalLikes}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Likes</div>
        </div>
        
        <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
          <EyeIcon className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalPlays}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Plays</div>
        </div>
        
        <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
          <FireIconSolid className="w-6 h-6 mx-auto mb-2 text-orange-500" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{streak}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Day Streak</div>
        </div>
      </div>
    </GlassCard>
  );
};

const Leaderboard = ({ users = [], currentUser = null }) => {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <TrophyIconSolid className="w-6 h-6 mr-2 text-yellow-500" />
          Global Leaderboard
        </h3>
        <Button size="sm" variant="outline">
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {users.slice(0, 10).map((user, index) => (
          <div 
            key={user.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-xl transition-all duration-200",
              index < 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
              user.id === currentUser?.id && "ring-2 ring-primary-500"
            )}
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                index === 0 ? "bg-yellow-500 text-white" :
                index === 1 ? "bg-gray-400 text-white" :
                index === 2 ? "bg-orange-600 text-white" :
                "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              )}>
                {index + 1}
              </div>
              
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-electric-400 flex items-center justify-center text-white font-medium">
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {user.username || `User ${user.id}`}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Level {user.level || 1}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-gray-900 dark:text-white">
                {user.totalXP || 0} XP
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {user.totalRecordings || 0} recordings
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

const GamificationDashboard = ({ user, achievements = [], leaderboard = [] }) => {
  const [activeTab, setActiveTab] = useState('achievements');

  // Sample achievements data
  const defaultAchievements = [
    {
      id: 'first_recording',
      title: 'First Steps',
      description: 'Upload your first field recording',
      icon: <MusicalNoteIcon className="w-8 h-8" />,
      rarity: 'common',
      progress: 1,
      maxProgress: 1,
      unlocked: true,
      unlockedAt: '2024-01-15',
      points: 10
    },
    {
      id: 'explorer',
      title: 'Sound Explorer',
      description: 'Upload recordings from 5 different locations',
      icon: <MapPinIcon className="w-8 h-8" />,
      rarity: 'rare',
      progress: 3,
      maxProgress: 5,
      unlocked: false,
      points: 50
    },
    {
      id: 'popular',
      title: 'Crowd Favorite',
      description: 'Get 100 likes across all your recordings',
      icon: <HeartIcon className="w-8 h-8" />,
      rarity: 'epic',
      progress: 67,
      maxProgress: 100,
      unlocked: false,
      points: 100
    },
    {
      id: 'streak_master',
      title: 'Streak Master',
      description: 'Upload recordings for 30 consecutive days',
      icon: <FireIconSolid className="w-8 h-8" />,
      rarity: 'legendary',
      progress: 15,
      maxProgress: 30,
      unlocked: false,
      points: 500
    },
    {
      id: 'viral',
      title: 'Viral Hit',
      description: 'Get 1000 plays on a single recording',
      icon: <BoltIconSolid className="w-8 h-8" />,
      rarity: 'legendary',
      progress: 234,
      maxProgress: 1000,
      unlocked: false,
      points: 1000
    }
  ];

  const userAchievements = achievements.length > 0 ? achievements : defaultAchievements;

  return (
    <div className="space-y-6">
      {/* User Reputation Card */}
      <ReputationCard 
        level={user?.level || 5}
        currentXP={user?.currentXP || 350}
        nextLevelXP={user?.nextLevelXP || 500}
        totalRecordings={user?.totalRecordings || 12}
        totalLikes={user?.totalLikes || 67}
        totalPlays={user?.totalPlays || 1234}
        streak={user?.streak || 15}
      />

      {/* Tab Navigation */}
      <div className="flex space-x-4">
        <button
          onClick={() => setActiveTab('achievements')}
          className={cn(
            "px-6 py-3 rounded-xl font-medium transition-all duration-200",
            activeTab === 'achievements'
              ? "bg-gradient-to-r from-primary-600 to-electric-600 text-white shadow-lg"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          Achievements
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={cn(
            "px-6 py-3 rounded-xl font-medium transition-all duration-200",
            activeTab === 'leaderboard'
              ? "bg-gradient-to-r from-primary-600 to-electric-600 text-white shadow-lg"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          Leaderboard
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'achievements' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userAchievements.map((achievement) => (
            <Achievement key={achievement.id} {...achievement} />
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Leaderboard 
            users={leaderboard.length > 0 ? leaderboard : [
              { id: 1, username: 'SoundMaster', level: 15, totalXP: 2340, totalRecordings: 45 },
              { id: 2, username: 'FieldRecorder', level: 12, totalXP: 1890, totalRecordings: 38 },
              { id: 3, username: 'AudioExplorer', level: 10, totalXP: 1567, totalRecordings: 29 },
              { id: 4, username: 'NatureSounds', level: 8, totalXP: 1234, totalRecordings: 23 },
              { id: 5, username: 'UrbanField', level: 7, totalXP: 987, totalRecordings: 18 }
            ]}
            currentUser={user}
          />
          
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Weekly Challenges
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Nature Sounds Week
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Upload 3 nature recordings
                  </div>
                </div>
                <div className="text-primary-600 dark:text-primary-400 font-bold">
                  +200 XP
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-electric-50 dark:bg-electric-900/20 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Community Explorer
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Like 10 recordings from other users
                  </div>
                </div>
                <div className="text-electric-600 dark:text-electric-400 font-bold">
                  +100 XP
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export { GamificationDashboard, Achievement, ReputationCard, Leaderboard };