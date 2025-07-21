const { sequelize } = require('../models');

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database schema...');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Check Users table
    try {
      const usersTable = await queryInterface.describeTable('Users');
      console.log('\n📋 Users table columns:');
      Object.keys(usersTable).forEach(column => {
        console.log(`  - ${column}: ${usersTable[column].type}`);
      });
      
      // Check for missing columns
      const expectedColumns = [
        'id', 'blockchainId', 'email', 'username', 'password', 'walletAddress',
        'role', 'reputation', 'totalRecordings', 'totalVotes', 'followersCount',
        'followingCount', 'totalLikes', 'totalBookmarks', 'profileImageUrl',
        'bio', 'isActive', 'registrationTimestamp', 'syncedWithBlockchain'
      ];
      
      const missingColumns = expectedColumns.filter(col => !usersTable[col]);
      if (missingColumns.length > 0) {
        console.log('\n❌ Missing columns in Users table:');
        missingColumns.forEach(col => console.log(`  - ${col}`));
      } else {
        console.log('\n✅ All expected columns present in Users table');
      }
      
    } catch (error) {
      console.log('\n❌ Users table does not exist or error accessing it:', error.message);
    }
    
    // Check other tables
    const tables = ['follows', 'recordings', 'likes', 'bookmarks', 'playlists'];
    
    for (const tableName of tables) {
      try {
        const tableDesc = await queryInterface.describeTable(tableName);
        console.log(`\n📋 ${tableName} table exists with ${Object.keys(tableDesc).length} columns`);
      } catch (error) {
        console.log(`\n❌ ${tableName} table does not exist`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    await sequelize.close();
  }
}

// Run check if called directly
if (require.main === module) {
  checkDatabaseSchema();
}

module.exports = checkDatabaseSchema;
