const mongoose = require('mongoose');
require('dotenv').config();

const dropAadharUniqueIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Get the efiledcases collection
    const db = mongoose.connection.db;
    const collection = db.collection('efiledcases');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // Drop the unique index on litigant.aadharNumber if it exists
    try {
      await collection.dropIndex('litigant.aadharNumber_1');
      console.log('✅ Successfully dropped unique index on litigant.aadharNumber');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index does not exist (already dropped or never created)');
      } else {
        throw error;
      }
    }

    // Verify indexes after drop
    const updatedIndexes = await collection.indexes();
    console.log('\nUpdated indexes:', JSON.stringify(updatedIndexes, null, 2));

    console.log('\n✅ Migration complete! One Aadhaar number can now have multiple cases.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

dropAadharUniqueIndex();
