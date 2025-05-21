const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const Recording = sequelize.define('Recording', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  artist: { type: DataTypes.STRING, allowNull: false },
  latitude: { type: DataTypes.FLOAT, allowNull: false },
  longitude: { type: DataTypes.FLOAT, allowNull: false },
  audioUrl: { type: DataTypes.STRING, allowNull: true },
});

Recording.belongsTo(User);
User.hasMany(Recording);

module.exports = Recording;