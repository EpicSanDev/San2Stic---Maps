const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vote = sequelize.define('Vote', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    proposalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'proposals',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    option: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Index of the selected option from the proposal options array'
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Calculated vote weight based on user reputation'
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
    tableName: 'votes',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['proposalId', 'userId']
      },
      {
        fields: ['proposalId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['option']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return Vote;
};