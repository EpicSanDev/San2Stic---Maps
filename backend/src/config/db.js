const { Sequelize } = require('sequelize');

// Use SQLite for testing if no DATABASE_URL provided
const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
    })
  : new Sequelize('sqlite::memory:', {
      dialect: 'sqlite',
      logging: false,
    });

module.exports = sequelize;