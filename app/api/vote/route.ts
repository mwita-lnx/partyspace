import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vote from '@/models/Vote';
import Participant from '@/models/Participant';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { sessionId, voterName, awardId, nominee, answer, ranking, timeSpent, isCorrect } = await request.json();

    if (!sessionId || !voterName || !awardId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already voted for this award (one vote per person per award)
    const existingVote = await Vote.findOne({ sessionId, voterName, awardId });

    if (existingVote) {
      // Update existing vote
      if (nominee !== undefined) existingVote.nominee = nominee;
      if (answer !== undefined) existingVote.answer = answer;
      if (ranking !== undefined) existingVote.ranking = ranking;
      if (timeSpent !== undefined) existingVote.timeSpent = timeSpent;
      if (isCorrect !== undefined) existingVote.isCorrect = isCorrect;
      await existingVote.save();
      return NextResponse.json({ success: true, message: 'Vote updated' });
    }

    // Create new vote
    await Vote.create({ sessionId, voterName, awardId, nominee, answer, ranking, timeSpent, isCorrect });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Vote error:', error);
    // Handle duplicate key error gracefully
    if (error.code === 11000) {
      return NextResponse.json({ success: true, message: 'Vote already recorded' });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const voterName = searchParams.get('voterName');

    if (!sessionId || !voterName) {
      return NextResponse.json({ error: 'Session ID and voter name required' }, { status: 400 });
    }

    const votes = await Vote.find({ sessionId, voterName });
    return NextResponse.json({ votes });
  } catch (error) {
    console.error('Fetch votes error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
