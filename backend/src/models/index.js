const sequelize = require('../config/db');
const User = require('./user');
const Recording = require('./recording');

const initDB = async () => {
  await sequelize.sync();
};

module.exports = { sequelize, User, Recording, initDB };