const sequelize = require('../config/db');
const User = require('./user');
const Recording = require('./recording');
const Like = require('./like');
const Bookmark = require('./bookmark');
const Follow = require('./follow');
const Share = require('./share');
const Playlist = require('./playlist');
const PlaylistRecording = require('./playlistRecording');

// Initialize models
const models = {
  User: User(sequelize),
  Recording: Recording(sequelize),
  Like: Like(sequelize),
  Bookmark: Bookmark(sequelize),
  Follow: Follow(sequelize),
  Share: Share(sequelize),
  Playlist: Playlist(sequelize),
  PlaylistRecording: PlaylistRecording(sequelize)
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// User associations
models.User.hasMany(models.Recording, { foreignKey: 'userId', as: 'recordings' });
models.User.hasMany(models.Like, { foreignKey: 'userId' });
models.User.hasMany(models.Bookmark, { foreignKey: 'userId' });
models.User.hasMany(models.Follow, { foreignKey: 'followerId', as: 'following' });
models.User.hasMany(models.Follow, { foreignKey: 'followingId', as: 'followers' });
models.User.hasMany(models.Share, { foreignKey: 'userId' });
models.User.hasMany(models.Playlist, { foreignKey: 'userId' });

// Recording associations
models.Recording.belongsTo(models.User, { foreignKey: 'userId', as: 'creator' });
models.Recording.hasMany(models.Like, { foreignKey: 'recordingId' });
models.Recording.hasMany(models.Bookmark, { foreignKey: 'recordingId' });
models.Recording.hasMany(models.Share, { foreignKey: 'recordingId' });
models.Recording.belongsToMany(models.Playlist, { 
  through: models.PlaylistRecording, 
  foreignKey: 'recordingId',
  otherKey: 'playlistId',
  as: 'playlists'
});

// Like associations
models.Like.belongsTo(models.User, { foreignKey: 'userId' });
models.Like.belongsTo(models.Recording, { foreignKey: 'recordingId' });

// Bookmark associations
models.Bookmark.belongsTo(models.User, { foreignKey: 'userId' });
models.Bookmark.belongsTo(models.Recording, { foreignKey: 'recordingId' });

// Follow associations
models.Follow.belongsTo(models.User, { foreignKey: 'followerId', as: 'follower' });
models.Follow.belongsTo(models.User, { foreignKey: 'followingId', as: 'following' });

// Share associations
models.Share.belongsTo(models.User, { foreignKey: 'userId' });
models.Share.belongsTo(models.Recording, { foreignKey: 'recordingId' });

// Playlist associations
models.Playlist.belongsTo(models.User, { foreignKey: 'userId', as: 'creator' });
models.Playlist.belongsToMany(models.Recording, { 
  through: models.PlaylistRecording, 
  foreignKey: 'playlistId',
  otherKey: 'recordingId',
  as: 'recordings'
});

// PlaylistRecording associations
models.PlaylistRecording.belongsTo(models.Playlist, { foreignKey: 'playlistId' });
models.PlaylistRecording.belongsTo(models.Recording, { foreignKey: 'recordingId' });

const initDB = async () => {
  await sequelize.sync();
};

module.exports = { 
  sequelize, 
  ...models,
  initDB 
};