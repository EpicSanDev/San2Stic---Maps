const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { Recording, User, Like, Bookmark, Share, Follow } = require('../models');
const { Op, Sequelize } = require('sequelize');

// Creator Analytics
router.get('/creator', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const timeframeMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    const days = timeframeMap[timeframe] || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (days * 2));

    // Current period analytics
    const [
      totalRecordings,
      totalLikes,
      totalBookmarks,
      totalShares,
      topRecordings,
      engagementTrends,
      followerGrowth
    ] = await Promise.all([
      // Total recordings in period
      Recording.count({
        where: {
          userId,
          createdAt: { [Op.gte]: since }
        }
      }),
      
      // Total likes received
      Like.count({
        include: [{
          model: Recording,
          where: { userId },
          required: true
        }],
        where: {
          createdAt: { [Op.gte]: since }
        }
      }),
      
      // Total bookmarks received
      Bookmark.count({
        include: [{
          model: Recording,
          where: { userId },
          required: true
        }],
        where: {
          createdAt: { [Op.gte]: since }
        }
      }),
      
      // Total shares received
      Share.count({
        include: [{
          model: Recording,
          where: { userId },
          required: true
        }],
        where: {
          createdAt: { [Op.gte]: since }
        }
      }),
      
      // Top performing recordings
      Recording.findAll({
        where: {
          userId,
          createdAt: { [Op.gte]: since }
        },
        attributes: [
          'id',
          'title',
          'likes',
          'bookmarks',
          'shares',
          [Sequelize.literal('(likes + bookmarks + shares)'), 'totalEngagement']
        ],
        order: [[Sequelize.literal('(likes + bookmarks + shares)'), 'DESC']],
        limit: 5
      }),
      
      // Engagement trends (daily breakdown)
      generateEngagementTrends(userId, since, days),
      
      // Follower growth
      getFollowerGrowth(userId, since, previousPeriodStart)
    ]);

    // Previous period data for comparison
    const previousPeriod = await getPreviousPeriodData(userId, previousPeriodStart, since);

    res.json({
      totalRecordings,
      totalLikes,
      totalBookmarks,
      totalShares,
      topRecordings,
      engagementTrends,
      followerGrowth,
      previousPeriod
    });
  } catch (error) {
    console.error('Error fetching creator analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Platform Analytics (Moderator/Admin only)
router.get('/platform', authenticateToken, requireRole(['moderator', 'admin']), async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    const timeframeMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    const days = timeframeMap[timeframe] || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (days * 2));

    const [
      totalUsers,
      totalRecordings,
      totalEngagement,
      activeUsers,
      topRecordings,
      engagementTrends,
      platformHealth
    ] = await Promise.all([
      // Total users in period
      User.count({
        where: {
          createdAt: { [Op.gte]: since }
        }
      }),
      
      // Total recordings in period
      Recording.count({
        where: {
          createdAt: { [Op.gte]: since }
        }
      }),
      
      // Total engagement (likes + bookmarks + shares)
      getTotalEngagement(since),
      
      // Active users (users who created content or interacted in period)
      getActiveUsers(since),
      
      // Top recordings platform-wide
      Recording.findAll({
        where: {
          createdAt: { [Op.gte]: since }
        },
        include: [{
          model: User,
          as: 'creator',
          attributes: ['username']
        }],
        attributes: [
          'id',
          'title',
          'likes',
          'bookmarks',
          'shares',
          [Sequelize.literal('(likes + bookmarks + shares)'), 'totalEngagement']
        ],
        order: [[Sequelize.literal('(likes + bookmarks + shares)'), 'DESC']],
        limit: 10
      }),
      
      // Platform engagement trends
      generatePlatformEngagementTrends(since, days),
      
      // Platform health metrics
      calculatePlatformHealth(since)
    ]);

    // Previous period data for comparison
    const previousPeriod = await getPlatformPreviousPeriodData(previousPeriodStart, since);

    res.json({
      totalUsers,
      totalRecordings,
      totalEngagement,
      activeUsers,
      topRecordings,
      engagementTrends,
      platformHealth,
      previousPeriod
    });
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper functions
async function generateEngagementTrends(userId, since, days) {
  const trends = [];
  const interval = Math.max(1, Math.floor(days / 7)); // Show up to 7 data points
  
  for (let i = 0; i < days; i += interval) {
    const periodStart = new Date(since);
    periodStart.setDate(since.getDate() + i);
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + interval);
    
    const [likes, bookmarks, shares] = await Promise.all([
      Like.count({
        include: [{
          model: Recording,
          where: { userId },
          required: true
        }],
        where: {
          createdAt: { [Op.between]: [periodStart, periodEnd] }
        }
      }),
      Bookmark.count({
        include: [{
          model: Recording,
          where: { userId },
          required: true
        }],
        where: {
          createdAt: { [Op.between]: [periodStart, periodEnd] }
        }
      }),
      Share.count({
        include: [{
          model: Recording,
          where: { userId },
          required: true
        }],
        where: {
          createdAt: { [Op.between]: [periodStart, periodEnd] }
        }
      })
    ]);
    
    trends.push({
      period: periodStart.toLocaleDateString(),
      likes,
      bookmarks,
      shares
    });
  }
  
  return trends;
}

async function generatePlatformEngagementTrends(since, days) {
  const trends = [];
  const interval = Math.max(1, Math.floor(days / 7));
  
  for (let i = 0; i < days; i += interval) {
    const periodStart = new Date(since);
    periodStart.setDate(since.getDate() + i);
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + interval);
    
    const [likes, bookmarks, shares] = await Promise.all([
      Like.count({
        where: {
          createdAt: { [Op.between]: [periodStart, periodEnd] }
        }
      }),
      Bookmark.count({
        where: {
          createdAt: { [Op.between]: [periodStart, periodEnd] }
        }
      }),
      Share.count({
        where: {
          createdAt: { [Op.between]: [periodStart, periodEnd] }
        }
      })
    ]);
    
    trends.push({
      period: periodStart.toLocaleDateString(),
      likes,
      bookmarks,
      shares
    });
  }
  
  return trends;
}

async function getFollowerGrowth(userId, since, previousPeriodStart) {
  const [current, previous] = await Promise.all([
    Follow.count({
      where: {
        followingId: userId,
        createdAt: { [Op.gte]: since }
      }
    }),
    Follow.count({
      where: {
        followingId: userId,
        createdAt: { [Op.between]: [previousPeriodStart, since] }
      }
    })
  ]);
  
  const total = await Follow.count({
    where: { followingId: userId }
  });
  
  return {
    total,
    change: current - previous
  };
}

async function getTotalEngagement(since) {
  const [likes, bookmarks, shares] = await Promise.all([
    Like.count({ where: { createdAt: { [Op.gte]: since } } }),
    Bookmark.count({ where: { createdAt: { [Op.gte]: since } } }),
    Share.count({ where: { createdAt: { [Op.gte]: since } } })
  ]);
  
  return likes + bookmarks + shares;
}

async function getActiveUsers(since) {
  // Users who created recordings or interacted (liked, bookmarked, shared) in the period
  const [recordingCreators, likers, bookmarkers, sharers] = await Promise.all([
    Recording.findAll({
      where: { createdAt: { [Op.gte]: since } },
      attributes: ['userId'],
      group: ['userId']
    }),
    Like.findAll({
      where: { createdAt: { [Op.gte]: since } },
      attributes: ['userId'],
      group: ['userId']
    }),
    Bookmark.findAll({
      where: { createdAt: { [Op.gte]: since } },
      attributes: ['userId'],
      group: ['userId']
    }),
    Share.findAll({
      where: { createdAt: { [Op.gte]: since } },
      attributes: ['userId'],
      group: ['userId']
    })
  ]);
  
  const activeUserIds = new Set([
    ...recordingCreators.map(r => r.userId),
    ...likers.map(l => l.userId),
    ...bookmarkers.map(b => b.userId),
    ...sharers.map(s => s.userId)
  ]);
  
  return activeUserIds.size;
}

async function calculatePlatformHealth(since) {
  // Simple platform health metrics
  const [
    totalRecordings,
    approvedRecordings,
    totalInteractions,
    negativeInteractions
  ] = await Promise.all([
    Recording.count({
      where: { createdAt: { [Op.gte]: since } }
    }),
    Recording.count({
      where: {
        createdAt: { [Op.gte]: since },
        moderationStatus: 'APPROVED'
      }
    }),
    getTotalEngagement(since),
    // Assuming downvotes are negative interactions
    Recording.sum('downvotes', {
      where: { createdAt: { [Op.gte]: since } }
    })
  ]);
  
  const qualityScore = totalRecordings > 0 ? Math.round((approvedRecordings / totalRecordings) * 100) : 100;
  const moderationEfficiency = qualityScore; // Simplified
  const userSatisfaction = totalInteractions > 0 ? 
    Math.round(((totalInteractions - (negativeInteractions || 0)) / totalInteractions) * 100) : 100;
  
  return {
    qualityScore,
    moderationEfficiency,
    userSatisfaction
  };
}

async function getPreviousPeriodData(userId, start, end) {
  const [recordings, likes, bookmarks, shares] = await Promise.all([
    Recording.count({
      where: {
        userId,
        createdAt: { [Op.between]: [start, end] }
      }
    }),
    Like.count({
      include: [{
        model: Recording,
        where: { userId },
        required: true
      }],
      where: {
        createdAt: { [Op.between]: [start, end] }
      }
    }),
    Bookmark.count({
      include: [{
        model: Recording,
        where: { userId },
        required: true
      }],
      where: {
        createdAt: { [Op.between]: [start, end] }
      }
    }),
    Share.count({
      include: [{
        model: Recording,
        where: { userId },
        required: true
      }],
      where: {
        createdAt: { [Op.between]: [start, end] }
      }
    })
  ]);
  
  return {
    totalRecordings: recordings,
    totalLikes: likes,
    totalBookmarks: bookmarks,
    totalShares: shares
  };
}

async function getPlatformPreviousPeriodData(start, end) {
  const [users, recordings, engagement, activeUsers] = await Promise.all([
    User.count({
      where: {
        createdAt: { [Op.between]: [start, end] }
      }
    }),
    Recording.count({
      where: {
        createdAt: { [Op.between]: [start, end] }
      }
    }),
    getTotalEngagement(start),
    getActiveUsers(start)
  ]);
  
  return {
    totalUsers: users,
    totalRecordings: recordings,
    totalEngagement: engagement,
    activeUsers: activeUsers
  };
}

module.exports = router;