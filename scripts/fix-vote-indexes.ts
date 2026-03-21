import mongoose from 'mongoose';

async function fixVoteIndexes() {
  try {
    // Using local MongoDB
    const mongoUri = 'mongodb://localhost:27017/bet-awards';

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const votesCollection = db!.collection('votes');

    // Drop the old unique index on participantId and awardId
    try {
      await votesCollection.dropIndex('participantId_1_awardId_1');
      console.log('Dropped old index: participantId_1_awardId_1');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('Old index does not exist, skipping drop');
      } else {
        throw error;
      }
    }

    // Create new unique index on participantId, awardId, and nominee
    await votesCollection.createIndex(
      { participantId: 1, awardId: 1, nominee: 1 },
      { unique: true }
    );
    console.log('Created new index: participantId_1_awardId_1_nominee_1');

    console.log('Vote indexes fixed successfully!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error fixing vote indexes:', error);
    process.exit(1);
  }
}

fixVoteIndexes();
