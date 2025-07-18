const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const Recording = sequelize.define('Recording', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  blockchainId: { type: DataTypes.INTEGER, allowNull: true, unique: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  artist: { type: DataTypes.STRING, allowNull: false },
  latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: false },
  longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: false },
  audioUrl: { type: DataTypes.STRING, allowNull: true },
  ipfsHash: { type: DataTypes.STRING, allowNull: true },
  duration: { type: DataTypes.INTEGER, allowNull: true },
  quality: { 
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'LOSSLESS'), 
    defaultValue: 'MEDIUM' 
  },
  equipment: { type: DataTypes.STRING(100), allowNull: true },
  license: { 
    type: DataTypes.ENUM(
      'ALL_RIGHTS_RESERVED',
      'CC_BY',
      'CC_BY_SA', 
      'CC_BY_NC',
      'CC_BY_NC_SA',
      'CC_BY_ND',
      'CC_BY_NC_ND',
      'PUBLIC_DOMAIN'
    ), 
    defaultValue: 'ALL_RIGHTS_RESERVED' 
  },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  moderationStatus: { 
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'), 
    defaultValue: 'PENDING' 
  },
  upvotes: { type: DataTypes.INTEGER, defaultValue: 0 },
  downvotes: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalRating: { type: DataTypes.INTEGER, defaultValue: 0 },
  ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  syncedWithBlockchain: { type: DataTypes.BOOLEAN, defaultValue: false }
});

Recording.belongsTo(User);
User.hasMany(Recording);

module.exports = Recording;
