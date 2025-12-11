import mongoose from 'mongoose';
import Participant from '../models/Participant';
import Award from '../models/Award';
import participantsData from '../data/participants.json';
import awardsData from '../data/awards.json';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bet-awards';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Participant.deleteMany({});
    await Award.deleteMany({});
    console.log('Cleared existing data');

    // Seed participants
    await Participant.insertMany(participantsData);
    console.log(`Seeded ${participantsData.length} participants`);

    // Seed awards
    await Award.insertMany(awardsData);
    console.log(`Seeded ${awardsData.length} awards`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
