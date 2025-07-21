const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Playlist = sequelize.define('Playlist', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    recordingsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'playlists',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['isPublic']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return Playlist;
};