const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validationMiddleware');
const Joi = require('joi');
const { User, Recording, Like, Bookmark, Follow, Share, Playlist, PlaylistRecording, Rating } = require('../models');
const { Op } = require('sequelize');

// Validation schemas
const playlistSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  description: Joi.string().max(500),
  isPublic: Joi.boolean().default(false),
  recordings: Joi.array().items(Joi.number().integer())
});

const addToPlaylistSchema = Joi.object({
  recordingId: Joi.number().integer().required()
});

const ratingSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required()
});

// Like/Unlike a recording
router.post('/recordings/:id/like', authenticateToken, async (req, res) => {
  try {
    const recordingId = req.params.id;
    const userId = req.user.id;

    // Check if recording exists
    const recording = await Recording.findByPk(recordingId);
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      where: { userId, recordingId }
    });

    if (existingLike) {
      return res.status(400).json({ message: 'Recording already liked' });
    }

    // Create like
    await Like.create({ userId, recordingId });

    // Update recording likes count
    await Recording.increment('likes', { where: { id: recordingId } });

    res.status(201).json({ message: 'Recording liked successfully' });
  } catch (error) {
    console.error('Error liking recording:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove like from recording
router.delete('/recordings/:id/like', authenticateToken, async (req, res) => {
  try {
    const recordingId = req.params.id;
    const userId = req.user.id;

    const like = await Like.findOne({
      where: { userId, recordingId }
    });

    if (!like) {
      return res.status(404).json({ message: 'Like not found' });
    }

    await like.destroy();

    // Update recording likes count
    await Recording.decrement('likes', { where: { id: recordingId } });

    res.json({ message: 'Like removed successfully' });
  } catch (error) {
    console.error('Error removing like:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Bookmark/Unbookmark a recording
router.post('/recordings/:id/bookmark', authenticateToken, async (req, res) => {
  try {
    const recordingId = req.params.id;
    const userId = req.user.id;

    // Check if recording exists
    const recording = await Recording.findByPk(recordingId);
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      where: { userId, recordingId }
    });

    if (existingBookmark) {
      return res.status(400).json({ message: 'Recording already bookmarked' });
    }

    // Create bookmark
    await Bookmark.create({ userId, recordingId });

    // Update recording bookmarks count
    await Recording.increment('bookmarks', { where: { id: recordingId } });

    res.status(201).json({ message: 'Recording bookmarked successfully' });
  } catch (error) {
    console.error('Error bookmarking recording:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove bookmark from recording
router.delete('/recordings/:id/bookmark', authenticateToken, async (req, res) => {
  try {
    const recordingId = req.params.id;
    const userId = req.user.id;

    const bookmark = await Bookmark.findOne({
      where: { userId, recordingId }
    });

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    await bookmark.destroy();

    // Update recording bookmarks count
    await Recording.decrement('bookmarks', { where: { id: recordingId } });

    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Follow/Unfollow a user
router.post('/users/:id/follow', authenticateToken, async (req, res) => {
  try {
    const followingId = parseInt(req.params.id);
    const followerId = req.user.id;

    if (followerId === followingId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if user exists
    const user = await User.findByPk(followingId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      where: { followerId, followingId }
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Create follow
    await Follow.create({ followerId, followingId });

    // Update user followers count
    await User.increment('followersCount', { where: { id: followingId } });
    await User.increment('followingCount', { where: { id: followerId } });

    res.status(201).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unfollow a user
router.delete('/users/:id/follow', authenticateToken, async (req, res) => {
  try {
    const followingId = parseInt(req.params.id);
    const followerId = req.user.id;

    const follow = await Follow.findOne({
      where: { followerId, followingId }
    });

    if (!follow) {
      return res.status(404).json({ message: 'Not following this user' });
    }

    await follow.destroy();

    // Update user followers count
    await User.decrement('followersCount', { where: { id: followingId } });
    await User.decrement('followingCount', { where: { id: followerId } });

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Share a recording
router.post('/recordings/:id/share', authenticateToken, async (req, res) => {
  try {
    const recordingId = req.params.id;
    const userId = req.user.id;
    const { platform } = req.body;

    // Check if recording exists
    const recording = await Recording.findByPk(recordingId);
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    // Create share record
    await Share.create({ userId, recordingId, platform });

    // Update recording shares count
    await Recording.increment('shares', { where: { id: recordingId } });

    res.status(201).json({ message: 'Recording shared successfully' });
  } catch (error) {
    console.error('Error sharing recording:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get social data for a recording
router.get('/recordings/:id/social', authenticateToken, async (req, res) => {
  try {
    const recordingId = req.params.id;
    const userId = req.user.id;

    const [recording, liked, bookmarked, following, userRating] = await Promise.all([
      Recording.findByPk(recordingId, {
        include: [{ model: User, as: 'creator', attributes: ['id'] }]
      }),
      Like.findOne({ where: { userId, recordingId } }),
      Bookmark.findOne({ where: { userId, recordingId } }),
      recording?.creator ? Follow.findOne({ 
        where: { followerId: userId, followingId: recording.creator.id } 
      }) : null,
      Rating.findOne({ where: { userId, recordingId } })
    ]);

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    const averageRating = recording.ratingCount > 0 ? 
      (recording.totalRating / recording.ratingCount).toFixed(1) : 0;

    res.json({
      liked: !!liked,
      bookmarked: !!bookmarked,
      following: !!following,
      userRating: userRating ? userRating.rating : null,
      likes: recording.likes || 0,
      bookmarks: recording.bookmarks || 0,
      shares: recording.shares || 0,
      averageRating: parseFloat(averageRating),
      totalRatings: recording.ratingCount || 0
    });
  } catch (error) {
    console.error('Error fetching social data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a playlist
router.post('/playlists', authenticateToken, validateRequest(playlistSchema), async (req, res) => {
  try {
    const { name, description, isPublic, recordings } = req.body;
    const userId = req.user.id;

    // Create playlist
    const playlist = await Playlist.create({
      name,
      description,
      isPublic,
      userId,
      recordingsCount: recordings ? recordings.length : 0
    });

    // Add recordings to playlist if provided
    if (recordings && recordings.length > 0) {
      const playlistRecordings = recordings.map(recordingId => ({
        playlistId: playlist.id,
        recordingId,
        addedAt: new Date()
      }));
      await PlaylistRecording.bulkCreate(playlistRecordings);
    }

    res.status(201).json(playlist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's playlists
router.get('/playlists/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const playlists = await Playlist.findAll({
      where: { userId },
      attributes: ['id', 'name', 'description', 'isPublic', 'recordingsCount', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add recording to playlist
router.post('/playlists/:id/recordings', authenticateToken, validateRequest(addToPlaylistSchema), async (req, res) => {
  try {
    const playlistId = parseInt(req.params.id);
    const { recordingId } = req.body;
    const userId = req.user.id;

    // Check if playlist exists and belongs to user
    const playlist = await Playlist.findOne({
      where: { id: playlistId, userId }
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found or access denied' });
    }

    // Check if recording exists
    const recording = await Recording.findByPk(recordingId);
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    // Check if recording is already in playlist
    const existingEntry = await PlaylistRecording.findOne({
      where: { playlistId, recordingId }
    });

    if (existingEntry) {
      return res.status(400).json({ message: 'Recording already in playlist' });
    }

    // Add recording to playlist
    await PlaylistRecording.create({
      playlistId,
      recordingId,
      addedAt: new Date()
    });

    // Update playlist recordings count
    await Playlist.increment('recordingsCount', { where: { id: playlistId } });

    res.status(201).json({ message: 'Recording added to playlist successfully' });
  } catch (error) {
    console.error('Error adding recording to playlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's bookmarked recordings
router.get('/recordings/bookmarked', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const bookmarks = await Bookmark.findAll({
      where: { userId },
      include: [{
        model: Recording,
        include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }]
      }],
      order: [['createdAt', 'DESC']]
    });

    const recordings = bookmarks.map(bookmark => bookmark.Recording);

    res.json(recordings);
  } catch (error) {
    console.error('Error fetching bookmarked recordings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's following list
router.get('/users/following', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const following = await Follow.findAll({
      where: { followerId: userId },
      include: [{
        model: User,
        as: 'following',
        attributes: ['id', 'username', 'reputation', 'followersCount']
      }],
      order: [['createdAt', 'DESC']]
    });

    const users = following.map(follow => follow.following);

    res.json(users);
  } catch (error) {
    console.error('Error fetching following list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Rate a recording
router.post('/recordings/:id/rate', authenticateToken, validateRequest(ratingSchema), async (req, res) => {
  try {
    const recordingId = req.params.id;
    const userId = req.user.id;
    const { rating } = req.body;

    // Check if recording exists
    const recording = await Recording.findByPk(recordingId);
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    // Check if user has already rated this recording
    const existingRating = await Rating.findOne({
      where: { userId, recordingId }
    });

    if (existingRating) {
      // Update existing rating
      const oldRating = existingRating.rating;
      existingRating.rating = rating;
      await existingRating.save();

      // Update recording's total rating
      const newTotalRating = recording.totalRating - oldRating + rating;
      await Recording.update(
        { totalRating: newTotalRating },
        { where: { id: recordingId } }
      );

      res.json({ 
        message: 'Rating updated successfully',
        averageRating: recording.ratingCount > 0 ? (newTotalRating / recording.ratingCount).toFixed(1) : 0
      });
    } else {
      // Create new rating
      await Rating.create({ userId, recordingId, rating });

      // Update recording's rating statistics
      const newTotalRating = recording.totalRating + rating;
      const newRatingCount = recording.ratingCount + 1;
      
      await Recording.update(
        { 
          totalRating: newTotalRating,
          ratingCount: newRatingCount
        },
        { where: { id: recordingId } }
      );

      res.status(201).json({ 
        message: 'Rating submitted successfully',
        averageRating: (newTotalRating / newRatingCount).toFixed(1)
      });
    }
  } catch (error) {
    console.error('Error rating recording:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get rating for a recording by current user
router.get('/recordings/:id/rating', authenticateToken, async (req, res) => {
  try {
    const recordingId = req.params.id;
    const userId = req.user.id;

    const rating = await Rating.findOne({
      where: { userId, recordingId }
    });

    const recording = await Recording.findByPk(recordingId, {
      attributes: ['totalRating', 'ratingCount']
    });

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    const averageRating = recording.ratingCount > 0 ? 
      (recording.totalRating / recording.ratingCount).toFixed(1) : 0;

    res.json({
      userRating: rating ? rating.rating : null,
      averageRating: parseFloat(averageRating),
      totalRatings: recording.ratingCount
    });
  } catch (error) {
    console.error('Error fetching rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove rating from recording
router.delete('/recordings/:id/rate', authenticateToken, async (req, res) => {
  try {
    const recordingId = req.params.id;
    const userId = req.user.id;

    const rating = await Rating.findOne({
      where: { userId, recordingId }
    });

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    const recording = await Recording.findByPk(recordingId);
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    // Remove rating and update recording statistics
    const removedRating = rating.rating;
    await rating.destroy();

    const newTotalRating = Math.max(0, recording.totalRating - removedRating);
    const newRatingCount = Math.max(0, recording.ratingCount - 1);

    await Recording.update(
      { 
        totalRating: newTotalRating,
        ratingCount: newRatingCount
      },
      { where: { id: recordingId } }
    );

    const averageRating = newRatingCount > 0 ? 
      (newTotalRating / newRatingCount).toFixed(1) : 0;

    res.json({ 
      message: 'Rating removed successfully',
      averageRating: parseFloat(averageRating)
    });
  } catch (error) {
    console.error('Error removing rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;