const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    blockchainId: { type: DataTypes.INTEGER, allowNull: true, unique: true },
    email: { type: DataTypes.STRING, allowNull: true, unique: true },
    username: { type: DataTypes.STRING(32), allowNull: true, unique: true },
    password: { type: DataTypes.STRING, allowNull: true },
    walletAddress: { type: DataTypes.STRING(42), allowNull: true, unique: true },
    role: { type: DataTypes.ENUM('user', 'moderator', 'admin'), defaultValue: 'user' },
    reputation: { type: DataTypes.INTEGER, defaultValue: 100 },
    totalRecordings: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalVotes: { type: DataTypes.INTEGER, defaultValue: 0 },
    followersCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    followingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalLikes: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalBookmarks: { type: DataTypes.INTEGER, defaultValue: 0 },
    profileImageUrl: { type: DataTypes.STRING, allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    registrationTimestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    syncedWithBlockchain: { type: DataTypes.BOOLEAN, defaultValue: false }
  });

  const bcrypt = require('bcryptjs');

  User.beforeCreate(async (user) => {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password') && user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  User.prototype.validPassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  return User;
};
