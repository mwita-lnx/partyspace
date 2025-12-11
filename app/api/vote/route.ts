import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vote from '@/models/Vote';
import Participant from '@/models/Participant';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { participantId, awardId, nominee } = await request.json();

    if (!participantId || !awardId || !nominee) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already voted for this award
    const existingVote = await Vote.findOne({ participantId, awardId });

    if (existingVote) {
      // Update existing vote
      existingVote.nominee = nominee;
      await existingVote.save();
    } else {
      // Create new vote
      await Vote.create({ participantId, awardId, nominee });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const searchParams = request.nextUrl.searchParams;
    const participantId = searchParams.get('participantId');

    if (!participantId) {
      return NextResponse.json({ error: 'Participant ID required' }, { status: 400 });
    }

    const votes = await Vote.find({ participantId });
    return NextResponse.json({ votes });
  } catch (error) {
    console.error('Fetch votes error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
