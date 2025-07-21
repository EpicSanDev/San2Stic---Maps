const { Recording, User } = require('../models');
const { uploadToIPFS, gatewayUrl } = require('../config/ipfs');
const blockchainService = require('../services/blockchainService');
const radioService = require('../services/radioService');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const fs = require('fs');
const { Op } = require('sequelize');

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
  ).optional()
});

const searchRecordingsSchema = Joi.object({
  query: Joi.string().max(100).optional(),
  quality: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'LOSSLESS').optional(),
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
  tags: Joi.string().optional(), // comma-separated
  minRating: Joi.number().min(1).max(5).optional(),
  maxRating: Joi.number().min(1).max(5).optional(),
  minDuration: Joi.number().min(0).optional(), // in seconds
  maxDuration: Joi.number().min(0).optional(),
  createdAfter: Joi.date().optional(),
  createdBefore: Joi.date().optional(),
  minLat: Joi.number().min(-90).max(90).optional(),
  maxLat: Joi.number().min(-90).max(90).optional(),
  minLng: Joi.number().min(-180).max(180).optional(),
  maxLng: Joi.number().min(-180).max(180).optional(),
  creatorId: Joi.string().optional(),
  sortBy: Joi.string().valid('created', 'rating', 'likes', 'title', 'artist', 'duration').default('created'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

exports.getAllRecordings = async (req, res) => {
  try {
    const { page = 1, limit = 50, status = 'APPROVED' } = req.query;
    const offset = (page - 1) * limit;

    const recordings = await Recording.findAndCountAll({
      where: { 
        moderationStatus: status,
        isActive: true 
      },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'email', 'username', 'reputation']
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
    console.error('Error fetching recordings:', err);
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
      license = 'ALL_RIGHTS_RESERVED' 
    } = value;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required.' });
    }

    const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/mp4'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Please select a valid audio file (MP3, WAV, OGG, or MP4)' });
    }

    try {
      const filename = `recordings/${uuidv4()}-${req.file.originalname}`;
      const metadata = {
        uploadedBy: userId,
        title: title,
        artist: artist,
        contentType: req.file.mimetype
      };

      const ipfsResult = await uploadToIPFS(req.file.buffer, filename, metadata);

      // Add to radio playlist using the new radio service
      try {
        const trackAdded = radioService.addTrackToPlaylist({
          url: ipfsResult.url,
          artist: artist,
          title: title,
          duration: req.body.duration || -1
        });
        
        if (trackAdded) {
          console.log(`Successfully added track to radio: ${artist} - ${title}`);
        } else {
          console.warn(`Failed to add track to radio: ${artist} - ${title}`);
        }
      } catch (radioError) {
        console.error('Radio service error:', radioError.message);
        // Don't fail the entire request if radio update fails
      }
      
      const duration = req.body.duration || 0;

      const newRecording = await Recording.create({
        title,
        description,
        artist,
        latitude,
        longitude,
        audioUrl: ipfsResult.url,
        ipfsHash: ipfsResult.hash,
        duration,
        quality: 'MEDIUM',
        equipment,
        license,
        tags,
        UserId: userId,
      });

      await User.increment('totalRecordings', { where: { id: userId } });

      res.status(201).json({
        ...newRecording.toJSON(),
        message: 'Recording created successfully and uploaded to IPFS'
      });
    } catch (err) {
      console.error('Error creating recording with IPFS upload:', err);
      res.status(500).json({ error: 'Failed to create recording with IPFS upload. ' + err.message });
    }

  } catch (err) {
    console.error('Error creating recording:', err);
    res.status(500).json({ error: 'Failed to create recording. ' + err.message });
  }
};

exports.getUserRecordings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const recordings = await Recording.findAndCountAll({
      where: { 
        UserId: req.user.id,
        isActive: true 
      },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'email', 'username']
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

exports.getRecordingsByLocation = async (req, res) => {
  try {
    const { minLat, maxLat, minLng, maxLng, page = 1, limit = 50 } = req.query;
    
    if (!minLat || !maxLat || !minLng || !maxLng) {
      return res.status(400).json({ error: 'Bounding box coordinates are required' });
    }

    const offset = (page - 1) * limit;

    const recordings = await Recording.findAndCountAll({
      where: {
        latitude: { [require('sequelize').Op.between]: [parseFloat(minLat), parseFloat(maxLat)] },
        longitude: { [require('sequelize').Op.between]: [parseFloat(minLng), parseFloat(maxLng)] },
        moderationStatus: 'APPROVED',
        isActive: true
      },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'email', 'username', 'reputation']
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
    console.error('Error fetching recordings by location:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateRecording = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = createRecordingSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const recording = await Recording.findOne({
      where: { 
        id: id,
        UserId: req.user.id,
        moderationStatus: 'PENDING' // Only allow updates to pending recordings
      }
    });

    if (!recording) {
      return res.status(404).json({ error: 'Recording not found or cannot be updated' });
    }

    await recording.update(value);
    
    res.json({
      ...recording.toJSON(),
      message: 'Recording updated successfully'
    });
  } catch (err) {
    console.error('Error updating recording:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRecording = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recording = await Recording.findOne({
      where: { 
        id: id,
        UserId: req.user.id
      }
    });

    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    await recording.update({ isActive: false });
    
    res.json({ message: 'Recording deleted successfully' });
  } catch (err) {
    console.error('Error deleting recording:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.searchRecordings = async (req, res) => {
  try {
    const { error, value } = searchRecordingsSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      query,
      quality,
      license,
      tags,
      minRating,
      maxRating,
      minDuration,
      maxDuration,
      createdAfter,
      createdBefore,
      minLat,
      maxLat,
      minLng,
      maxLng,
      creatorId,
      sortBy,
      sortOrder,
      page,
      limit
    } = value;

    const offset = (page - 1) * limit;
    const whereClause = {
      moderationStatus: 'APPROVED',
      isActive: true
    };

    // Text search in title, description, and artist
    if (query) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
        { artist: { [Op.iLike]: `%${query}%` } }
      ];
    }

    // Quality filter
    if (quality) {
      whereClause.quality = quality;
    }

    // License filter
    if (license) {
      whereClause.license = license;
    }

    // Tags filter (search in JSON array)
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      whereClause.tags = {
        [Op.overlap]: tagArray
      };
    }

    // Rating filter (based on average rating)
    if (minRating || maxRating) {
      const ratingConditions = {};
      if (minRating && maxRating) {
        // Calculate rating range based on totalRating and ratingCount
        ratingConditions[Op.and] = [
          { ratingCount: { [Op.gt]: 0 } },
          {
            [Op.or]: [
              // For recordings with ratings
              {
                [Op.and]: [
                  { ratingCount: { [Op.gt]: 0 } },
                  {
                    // totalRating / ratingCount >= minRating AND <= maxRating
                    totalRating: {
                      [Op.and]: [
                        { [Op.gte]: minRating * 1 }, // Will be multiplied by ratingCount in SQL
                        { [Op.lte]: maxRating * 999 } // Approximation for max range
                      ]
                    }
                  }
                ]
              }
            ]
          }
        ];
      } else if (minRating) {
        ratingConditions[Op.and] = [
          { ratingCount: { [Op.gt]: 0 } },
          { totalRating: { [Op.gte]: minRating * 1 } }
        ];
      } else if (maxRating) {
        ratingConditions[Op.or] = [
          { ratingCount: { [Op.eq]: 0 } }, // Include unrated recordings
          {
            [Op.and]: [
              { ratingCount: { [Op.gt]: 0 } },
              { totalRating: { [Op.lte]: maxRating * 999 } }
            ]
          }
        ];
      }
      Object.assign(whereClause, ratingConditions);
    }

    // Duration filter
    if (minDuration !== undefined || maxDuration !== undefined) {
      whereClause.duration = {};
      if (minDuration !== undefined) {
        whereClause.duration[Op.gte] = minDuration;
      }
      if (maxDuration !== undefined) {
        whereClause.duration[Op.lte] = maxDuration;
      }
    }

    // Date range filter
    if (createdAfter || createdBefore) {
      whereClause.createdAt = {};
      if (createdAfter) {
        whereClause.createdAt[Op.gte] = new Date(createdAfter);
      }
      if (createdBefore) {
        whereClause.createdAt[Op.lte] = new Date(createdBefore);
      }
    }

    // Location filter (bounding box)
    if (minLat && maxLat && minLng && maxLng) {
      whereClause.latitude = { [Op.between]: [parseFloat(minLat), parseFloat(maxLat)] };
      whereClause.longitude = { [Op.between]: [parseFloat(minLng), parseFloat(maxLng)] };
    }

    // Creator filter
    if (creatorId) {
      whereClause.UserId = creatorId;
    }

    // Build order clause
    let orderClause;
    switch (sortBy) {
      case 'rating':
        // Sort by average rating (totalRating / ratingCount)
        orderClause = [
          [
            require('sequelize').literal('CASE WHEN "ratingCount" > 0 THEN "totalRating"::float / "ratingCount" ELSE 0 END'),
            sortOrder
          ]
        ];
        break;
      case 'likes':
        orderClause = [['likes', sortOrder]];
        break;
      case 'title':
        orderClause = [['title', sortOrder]];
        break;
      case 'artist':
        orderClause = [['artist', sortOrder]];
        break;
      case 'duration':
        orderClause = [['duration', sortOrder]];
        break;
      case 'created':
      default:
        orderClause = [['createdAt', sortOrder]];
        break;
    }

    const recordings = await Recording.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['id', 'email', 'username', 'reputation'],
        as: 'creator'
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: orderClause,
      distinct: true // Important for correct count with includes
    });

    // Add calculated average rating to each recording
    const recordingsWithRating = recordings.rows.map(recording => {
      const recordingData = recording.toJSON();
      recordingData.averageRating = recordingData.ratingCount > 0 
        ? (recordingData.totalRating / recordingData.ratingCount).toFixed(1)
        : null;
      return recordingData;
    });

    res.json({
      recordings: recordingsWithRating,
      totalCount: recordings.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(recordings.count / limit),
      searchFilters: value // Return applied filters for debugging
    });
  } catch (err) {
    console.error('Error searching recordings:', err);
    res.status(500).json({ error: err.message });
  }
};
