import React, { useState, useEffect } from 'react';
import { Card, GlassCard } from './ui/Card';
import LoadingSpinner from './ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { 
  ChartBarIcon, 
  UsersIcon, 
  SpeakerWaveIcon, 
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  TrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AnalyticsDashboard = ({ userType = 'creator' }) => {
  const { user, isAuthenticated } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
    }
  }, [isAuthenticated, timeframe, userType]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = userType === 'moderator' 
        ? `/api/analytics/platform?timeframe=${timeframe}`
        : `/api/analytics/creator?timeframe=${timeframe}`;
        
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (!isAuthenticated) {
    return (
      <GlassCard className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Please log in to view analytics dashboard
        </p>
      </GlassCard>
    );
  }

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading analytics...</span>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading analytics: {error}</p>
          <button 
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </GlassCard>
    );
  }

  const StatCard = ({ title, value, change, icon: Icon, color = "blue" }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(value)}</p>
          {change !== undefined && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% from last period
            </p>
          )}
        </div>
        <Icon className={`w-8 h-8 text-${color}-500`} />
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {userType === 'moderator' ? 'Platform Analytics' : 'Creator Analytics'}
        </h2>
        <div className="flex gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {analytics && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {userType === 'moderator' ? (
              <>
                <StatCard 
                  title="Total Users" 
                  value={analytics.totalUsers} 
                  change={calculatePercentageChange(analytics.totalUsers, analytics.previousPeriod?.totalUsers)}
                  icon={UsersIcon} 
                />
                <StatCard 
                  title="Total Recordings" 
                  value={analytics.totalRecordings} 
                  change={calculatePercentageChange(analytics.totalRecordings, analytics.previousPeriod?.totalRecordings)}
                  icon={SpeakerWaveIcon} 
                />
                <StatCard 
                  title="Total Engagement" 
                  value={analytics.totalEngagement} 
                  change={calculatePercentageChange(analytics.totalEngagement, analytics.previousPeriod?.totalEngagement)}
                  icon={HeartIcon} 
                  color="red"
                />
                <StatCard 
                  title="Active Users" 
                  value={analytics.activeUsers} 
                  change={calculatePercentageChange(analytics.activeUsers, analytics.previousPeriod?.activeUsers)}
                  icon={TrendingUpIcon} 
                  color="green"
                />
              </>
            ) : (
              <>
                <StatCard 
                  title="Your Recordings" 
                  value={analytics.totalRecordings} 
                  change={calculatePercentageChange(analytics.totalRecordings, analytics.previousPeriod?.totalRecordings)}
                  icon={SpeakerWaveIcon} 
                />
                <StatCard 
                  title="Total Likes" 
                  value={analytics.totalLikes} 
                  change={calculatePercentageChange(analytics.totalLikes, analytics.previousPeriod?.totalLikes)}
                  icon={HeartIcon} 
                  color="red"
                />
                <StatCard 
                  title="Total Bookmarks" 
                  value={analytics.totalBookmarks} 
                  change={calculatePercentageChange(analytics.totalBookmarks, analytics.previousPeriod?.totalBookmarks)}
                  icon={BookmarkIcon} 
                  color="blue"
                />
                <StatCard 
                  title="Total Shares" 
                  value={analytics.totalShares} 
                  change={calculatePercentageChange(analytics.totalShares, analytics.previousPeriod?.totalShares)}
                  icon={ShareIcon} 
                  color="green"
                />
              </>
            )}
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Content */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {userType === 'moderator' ? 'Top Recordings' : 'Your Top Performing Recordings'}
              </h3>
              <div className="space-y-3">
                {analytics.topRecordings?.map((recording, index) => (
                  <div key={recording.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium text-gray-900 dark:text-white">{recording.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {recording.likes} likes • {recording.bookmarks} bookmarks • {recording.shares} shares
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {recording.totalEngagement} total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Engagement Trends */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Engagement Over Time
              </h3>
              <div className="space-y-4">
                {analytics.engagementTrends?.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{trend.period}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-red-500">{trend.likes} likes</span>
                      <span className="text-blue-500">{trend.bookmarks} bookmarks</span>
                      <span className="text-green-500">{trend.shares} shares</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Platform Health (Moderator Only) */}
          {userType === 'moderator' && analytics.platformHealth && (
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Platform Health Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">{analytics.platformHealth.qualityScore}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Content Quality Score</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-500">{analytics.platformHealth.moderationEfficiency}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Moderation Efficiency</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-500">{analytics.platformHealth.userSatisfaction}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">User Satisfaction</p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* User Growth (Creator) */}
          {userType === 'creator' && analytics.followerGrowth && (
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Follower Growth
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics.followerGrowth.total}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Followers</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${analytics.followerGrowth.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {analytics.followerGrowth.change >= 0 ? '+' : ''}{analytics.followerGrowth.change}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This period</p>
                </div>
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;