const Recording = require('../models/recording');
const User = require('../models/user');
const { bucket, bucketName } = require('../config/gcs');
const blockchainService = require('../services/blockchainService');
const { v4: uuidv4 } = require('uuid');
const { format } = require('util');
const Joi = require('joi');

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

    const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid audio file format.' });
    }

    const blob = bucket.file(`recordings/${uuidv4()}-${req.file.originalname}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: req.file.mimetype,
      metadata: {
        metadata: {
          uploadedBy: userId,
          title: title,
          artist: artist
        }
      }
    });

    blobStream.on('error', (err) => {
      console.error('GCS Upload Error:', err);
      res.status(500).json({ error: 'Failed to upload audio file. ' + err.message });
    });

    blobStream.on('finish', async () => {
      try {
        await blob.makePublic();
        const publicUrl = format(`https://storage.googleapis.com/${bucketName}/${blob.name}`);

        const duration = req.body.duration || 0;

        const newRecording = await Recording.create({
          title,
          description,
          artist,
          latitude,
          longitude,
          audioUrl: publicUrl,
          duration,
          quality: 'MEDIUM', // Default quality
          equipment,
          license,
          tags,
          UserId: userId,
        });

        await User.increment('totalRecordings', { where: { id: userId } });

        res.status(201).json({
          ...newRecording.toJSON(),
          message: 'Recording created successfully'
        });
      } catch (err) {
        console.error('Error creating recording after GCS upload:', err);
        res.status(500).json({ error: 'Failed to create recording after GCS upload. ' + err.message });
      }
    });

    blobStream.end(req.file.buffer);

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
