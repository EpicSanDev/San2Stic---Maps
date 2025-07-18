const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  blockchainId: { type: DataTypes.INTEGER, allowNull: true, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  username: { type: DataTypes.STRING(32), allowNull: true, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  walletAddress: { type: DataTypes.STRING(42), allowNull: true, unique: true },
  role: { type: DataTypes.ENUM('user', 'moderator', 'admin'), defaultValue: 'user' },
  reputation: { type: DataTypes.INTEGER, defaultValue: 100 },
  totalRecordings: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalVotes: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  registrationTimestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  syncedWithBlockchain: { type: DataTypes.BOOLEAN, defaultValue: false }
});

User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.prototype.validPassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;
