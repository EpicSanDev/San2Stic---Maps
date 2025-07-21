const { sequelize } = require('../models');

async function migrateUserColumns() {
  try {
    console.log('🔄 Starting user columns migration...');
    
    // Add missing columns to Users table
    const queryInterface = sequelize.getQueryInterface();
    
    // Check if columns exist before adding them
    const tableDescription = await queryInterface.describeTable('Users');
    
    if (!tableDescription.followersCount) {
      await queryInterface.addColumn('Users', 'followersCount', {
        type: sequelize.Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
      console.log('✅ Added followersCount column');
    }
    
    if (!tableDescription.followingCount) {
      await queryInterface.addColumn('Users', 'followingCount', {
        type: sequelize.Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
      console.log('✅ Added followingCount column');
    }
    
    if (!tableDescription.totalLikes) {
      await queryInterface.addColumn('Users', 'totalLikes', {
        type: sequelize.Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
      console.log('✅ Added totalLikes column');
    }
    
    if (!tableDescription.totalBookmarks) {
      await queryInterface.addColumn('Users', 'totalBookmarks', {
        type: sequelize.Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
      console.log('✅ Added totalBookmarks column');
    }
    
    if (!tableDescription.profileImageUrl) {
      await queryInterface.addColumn('Users', 'profileImageUrl', {
        type: sequelize.Sequelize.STRING,
        allowNull: true
      });
      console.log('✅ Added profileImageUrl column');
    }
    
    if (!tableDescription.bio) {
      await queryInterface.addColumn('Users', 'bio', {
        type: sequelize.Sequelize.TEXT,
        allowNull: true
      });
      console.log('✅ Added bio column');
    }
    
    if (!tableDescription.isActive) {
      await queryInterface.addColumn('Users', 'isActive', {
        type: sequelize.Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });
      console.log('✅ Added isActive column');
    }
    
    if (!tableDescription.syncedWithBlockchain) {
      await queryInterface.addColumn('Users', 'syncedWithBlockchain', {
        type: sequelize.Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
      console.log('✅ Added syncedWithBlockchain column');
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateUserColumns();
}

module.exports = migrateUserColumns;
