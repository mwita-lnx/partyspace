import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vote from '@/models/Vote';
import Participant from '@/models/Participant';
import Award from '@/models/Award';

export async function GET() {
  try {
    await dbConnect();

    const votes = await Vote.find({})
      .populate('participantId', 'name')
      .populate('awardId', 'title emoji')
      .sort({ createdAt: -1 });

    return NextResponse.json({ votes });
  } catch (error) {
    console.error('Fetch all votes error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
