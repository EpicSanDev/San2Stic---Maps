const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Proposal = sequelize.define('Proposal', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('platform_parameter', 'content_policy', 'community_guideline', 'feature_request'),
      allowNull: false
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ['For', 'Against']
    },
    status: {
      type: DataTypes.ENUM('active', 'passed', 'rejected', 'cancelled'),
      defaultValue: 'active'
    },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    votingPeriod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 7
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
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
    tableName: 'proposals',
    timestamps: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['type']
      },
      {
        fields: ['creatorId']
      },
      {
        fields: ['endDate']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return Proposal;
};