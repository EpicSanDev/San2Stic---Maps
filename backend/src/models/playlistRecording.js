const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PlaylistRecording = sequelize.define('PlaylistRecording', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    playlistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Playlists',
        key: 'id'
      }
    },
    recordingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Recordings',
        key: 'id'
      }
    },
    addedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'playlist_recordings',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['playlistId', 'recordingId']
      },
      {
        fields: ['playlistId']
      },
      {
        fields: ['recordingId']
      },
      {
        fields: ['addedAt']
      }
    ]
  });

  return PlaylistRecording;
};