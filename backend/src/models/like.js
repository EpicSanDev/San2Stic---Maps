const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Like = sequelize.define('Like', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'likes',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'recordingId']
      },
      {
        fields: ['recordingId']
      },
      {
        fields: ['userId']
      }
    ]
  });

  return Like;
};