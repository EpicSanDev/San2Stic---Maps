const { Recording, User, Like, Bookmark } = require('../models');
const { Op, Sequelize } = require('sequelize');
const { uploadToIPFS, gatewayUrl } = require('../config/ipfs');
const blockchainService = require('../services/blockchainService');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const fs = require('fs');

const createRecordingSchema = Joi.object({
  title: Joi.string().max(100).required(),
  description: Joi.string().max(500).optional(),
  artist: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  tags: Joi.array().items(Joi.string().max(32)).max(10).optional(),
  equipment: Joi.string().max(100).optional(),
  license: Joi.string().valid(
    'ALL_RIGHTS_RESERVED',
    'CC_BY',
    'CC_BY_SA',
    'CC_BY_NC',
    'CC_BY_NC_SA',
    'CC_BY_ND',
    'CC_BY_NC_ND',
    'PUBLIC_DOMAIN'
  ).optional(),
  genre: Joi.string().max(50).optional(),
  audioQuality: Joi.string().max(50).optional()
});

// Enhanced getAllRecordings with advanced filtering
exports.getAllRecordings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status = 'APPROVED',
      quality,
      licenseType,
      creatorReputation,
      genre,
      dateStart,
      dateEnd,
      durationMin,
      durationMax,
      audioQuality,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      lat,
      lng,
      radius
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions = {
      moderationStatus: status,
      isActive: true
    };

    // Quality filter
    if (quality) {
      whereConditions.quality = quality.toUpperCase();
    }

    // License filter
    if (licenseType) {
      whereConditions.license = licenseType.toUpperCase().replace(/[-\s]/g, '_');
    }

    // Genre filter
    if (genre) {
      whereConditions[Op.or] = [
        { genre: { [Op.iLike]: `%${genre}%` } },
        { tags: { [Op.contains]: [genre] } }
      ];
    }

    // Date range filter
    if (dateStart || dateEnd) {
      whereConditions.createdAt = {};
      if (dateStart) {
        whereConditions.createdAt[Op.gte] = new Date(dateStart);
      }
      if (dateEnd) {
        whereConditions.createdAt[Op.lte] = new Date(dateEnd);
      }
    }

    // Duration filter
    if (durationMin || durationMax) {
      whereConditions.duration = {};
      if (durationMin) {
        whereConditions.duration[Op.gte] = parseInt(durationMin);
      }
      if (durationMax) {
        whereConditions.duration[Op.lte] = parseInt(durationMax);
      }
    }

    // Audio quality filter
    if (audioQuality) {
      whereConditions.audioQuality = { [Op.iLike]: `%${audioQuality}%` };
    }

    // Search in title, description, artist
    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { artist: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Location-based filter (if lat, lng, radius provided)
    if (lat && lng && radius) {
      const radiusInDegrees = parseFloat(radius) / 111; // Rough conversion km to degrees
      whereConditions.latitude = {
        [Op.between]: [parseFloat(lat) - radiusInDegrees, parseFloat(lat) + radiusInDegrees]
      };
      whereConditions.longitude = {
        [Op.between]: [parseFloat(lng) - radiusInDegrees, parseFloat(lng) + radiusInDegrees]
      };
    }

    // User reputation filter
    const userWhereConditions = {};
    if (creatorReputation) {
      switch (creatorReputation) {
        case 'high':
          userWhereConditions.reputation = { [Op.gte]: 1000 };
          break;
        case 'medium':
          userWhereConditions.reputation = { [Op.between]: [100, 999] };
          break;
        case 'new':
          userWhereConditions.reputation = { [Op.lt]: 100 };
          break;
      }
    }

    // Build order clause
    const validSortFields = ['createdAt', 'title', 'artist', 'likes', 'bookmarks', 'shares', 'upvotes', 'totalRating', 'duration'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    let orderClause = [[orderField, orderDirection]];
    
    // Special handling for popularity sorting
    if (sortBy === 'popularity') {
      orderClause = [
        [Sequelize.literal('(likes + bookmarks + shares)'), orderDirection]
      ];
    }

    const recordings = await Recording.findAndCountAll({
      where: whereConditions,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'reputation', 'profileImageUrl'],
        where: Object.keys(userWhereConditions).length > 0 ? userWhereConditions : undefined
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: orderClause,
      distinct: true
    });

    res.json({
      recordings: recordings.rows,
      totalCount: recordings.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(recordings.count / limit),
      filters: {
        quality,
        licenseType,
        creatorReputation,
        genre,
        dateStart,
        dateEnd,
        durationMin,
        durationMax,
        audioQuality,
        sortBy,
        sortOrder
      }
    });
  } catch (err) {
    console.error('Error fetching recordings:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get recordings with social data for authenticated users
exports.getRecordingsWithSocialData = async (req, res) => {
  try {
    const userId = req.user?.id;
    const recordings = await exports.getAllRecordings(req, res);
    
    if (userId && recordings.recordings) {
      // Add social data for each recording
      for (let recording of recordings.recordings) {
        const [liked, bookmarked] = await Promise.all([
          Like.findOne({ where: { userId, recordingId: recording.id } }),
          Bookmark.findOne({ where: { userId, recordingId: recording.id } })
        ]);
        
        recording.dataValues.userInteractions = {
          liked: !!liked,
          bookmarked: !!bookmarked
        };
      }
    }
    
    return recordings;
  } catch (err) {
    console.error('Error fetching recordings with social data:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.createRecording = async (req, res) => {
  try {
    const { error, value } = createRecordingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { 
      title, 
      description, 
      artist, 
      latitude, 
      longitude, 
      tags = [], 
      equipment, 
      license = 'ALL_RIGHTS_RESERVED',
      genre,
      audioQuality
    } = value;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required.' });
    }

    let ipfsHash = null;
    let audioUrl = null;

    try {
      // Upload to IPFS
      const ipfsResult = await uploadToIPFS(req.file.buffer, req.file.originalname);
      ipfsHash = ipfsResult.hash;
      audioUrl = gatewayUrl(ipfsHash);
      
      console.log(`✅ Audio uploaded to IPFS: ${ipfsHash}`);
    } catch (ipfsError) {
      console.error('IPFS upload failed:', ipfsError);
      // Continue without IPFS for now
      audioUrl = `/uploads/${req.file.filename}`;
    }

    // Create recording
    const recording = await Recording.create({
      title,
      description,
      artist,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      audioUrl,
      ipfsHash,
      tags,
      equipment,
      license,
      genre,
      audioQuality,
      quality: audioQuality?.includes('lossless') || audioQuality?.includes('FLAC') ? 'LOSSLESS' : 
               audioQuality?.includes('320') ? 'HIGH' : 'MEDIUM',
      duration: req.body.duration ? parseInt(req.body.duration) : null,
      userId
    });

    // Increment user's total recordings
    await User.increment('totalRecordings', { where: { id: userId } });

    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanup) {
        console.warn('Could not clean up uploaded file:', cleanup.message);
      }
    }

    // Try to sync with blockchain
    try {
      const blockchainId = await blockchainService.createRecording({
        title,
        description,
        ipfsHash: ipfsHash || '',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        license
      });
      
      await recording.update({ 
        blockchainId, 
        syncedWithBlockchain: true 
      });
      
      console.log(`✅ Recording synced to blockchain with ID: ${blockchainId}`);
    } catch (blockchainError) {
      console.error('❌ Blockchain sync failed:', blockchainError);
      // Continue without blockchain sync
    }

    // Fetch the recording with user data
    const createdRecording = await Recording.findByPk(recording.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'reputation']
      }]
    });

    res.status(201).json(createdRecording);
  } catch (err) {
    console.error('Error creating recording:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getRecordingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const recording = await Recording.findByPk(id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'reputation', 'profileImageUrl', 'bio']
      }]
    });

    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    // Increment view count
    await recording.increment('viewCount');

    // Add social data if user is authenticated
    if (userId) {
      const [liked, bookmarked] = await Promise.all([
        Like.findOne({ where: { userId, recordingId: id } }),
        Bookmark.findOne({ where: { userId, recordingId: id } })
      ]);
      
      recording.dataValues.userInteractions = {
        liked: !!liked,
        bookmarked: !!bookmarked
      };
    }

    res.json(recording);
  } catch (err) {
    console.error('Error fetching recording:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getUserRecordings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const recordings = await Recording.findAndCountAll({
      where: { 
        userId,
        isActive: true 
      },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'reputation']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      recordings: recordings.rows,
      totalCount: recordings.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(recordings.count / limit)
    });
  } catch (err) {
    console.error('Error fetching user recordings:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get trending recordings (high engagement)
exports.getTrendingRecordings = async (req, res) => {
  try {
    const { limit = 10, timeframe = '7d' } = req.query;
    
    // Calculate date based on timeframe
    const timeframeMap = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    
    const days = timeframeMap[timeframe] || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const recordings = await Recording.findAll({
      where: {
        moderationStatus: 'APPROVED',
        isActive: true,
        createdAt: { [Op.gte]: since }
      },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'reputation', 'profileImageUrl']
      }],
      order: [
        [Sequelize.literal('(likes + bookmarks + shares + upvotes)'), 'DESC'],
        ['viewCount', 'DESC']
      ],
      limit: parseInt(limit)
    });

    res.json(recordings);
  } catch (err) {
    console.error('Error fetching trending recordings:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = exports;