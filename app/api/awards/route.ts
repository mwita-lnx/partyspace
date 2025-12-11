import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Award from '@/models/Award';
import Participant from '@/models/Participant';

export async function GET() {
  try {
    await dbConnect();

    // Fetch all participants to use as nominees
    const participants = await Participant.find({}).sort({ name: 1 });
    const allParticipantNames = participants.map(p => p.name);

    // Fetch awards and replace nominees with all participants
    const awards = await Award.find({}).sort({ createdAt: 1 });
    const awardsWithAllParticipants = awards.map(award => ({
      ...award.toObject(),
      nominees: allParticipantNames
    }));

    return NextResponse.json({ awards: awardsWithAllParticipants });
  } catch (error) {
    console.error('Fetch awards error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
