const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Share = sequelize.define('Share', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    recordingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Recordings',
        key: 'id'
      }
    },
    platform: {
      type: DataTypes.ENUM('copy', 'twitter', 'facebook', 'whatsapp', 'email', 'other'),
      allowNull: false,
      defaultValue: 'copy'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'shares',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        fields: ['recordingId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['platform']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return Share;
};