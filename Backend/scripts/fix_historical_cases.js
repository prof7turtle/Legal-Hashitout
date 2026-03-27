const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from Backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const EFiledCase = require('../models/EFiledCase');

async function fixHistoricalCases() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully.');

    const casesToFix = await EFiledCase.find({ assignedLawyer: { $exists: false } });
    console.log(`Found ${casesToFix.length} cases without an assigned lawyer.`);

    let count = 0;
    for (const c of casesToFix) {
      // Find the "Case Filed" entry in timeline
      const filedEntry = c.timeline.find(t => t.action === 'Case Filed');
      
      if (filedEntry && filedEntry.performedBy) {
        c.assignedLawyer = filedEntry.performedBy;
        await c.save();
        count++;
        console.log(`Fixed case ${c.caseNumber} (Assigned to: ${filedEntry.performedBy})`);
      }
    }

    console.log(`Successfully updated ${count} cases.`);
    process.exit(0);
  } catch (error) {
    console.error('Error fixing cases:', error);
    process.exit(1);
  }
}

fixHistoricalCases();
