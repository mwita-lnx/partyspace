import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vote from '@/models/bet-awards/Vote';

/**
 * BET Awards Voting API
 * Uses userId as the primary identifier to prevent duplicate voting
 * This is specific to BET Awards and separate from generic session voting
 */
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const { sessionId, userId, voterName, awardId, nominee, answer, ranking, timeSpent, isCorrect } = body;

    // Validation
    if (!sessionId || !userId || !awardId) {
      return NextResponse.json(
        { error: 'Session ID, User ID, and Award ID are required' },
        { status: 400 }
      );
    }

    // Check if this user has already voted for this award in this session
    // Uses userId as the primary identifier - prevents voting with different names
    const existingVote = await Vote.findOne({
      sessionId,
      voterUserId: userId,
      awardId
    });

    if (existingVote) {
      // Update existing vote (allow users to change their vote)
      existingVote.nominee = nominee;
      existingVote.voterName = voterName; // Update name if they changed it
      existingVote.answer = answer;
      existingVote.ranking = ranking;
      existingVote.timeSpent = timeSpent;
      existingVote.isCorrect = isCorrect;

      await existingVote.save();

      return NextResponse.json({
        success: true,
        vote: existingVote,
        message: 'Vote updated successfully'
      });
    }

    // Create new vote
    const vote = await Vote.create({
      sessionId,
      voterName: voterName || 'Anonymous',
      voterUserId: userId,
      awardId,
      nominee,
      answer,
      ranking,
      timeSpent,
      isCorrect
    });

    return NextResponse.json({
      success: true,
      vote,
      message: 'Vote recorded successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error recording BET Awards vote:', error);

    // Handle duplicate key error from database
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'You have already voted for this award' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}

// GET - Fetch user's votes for a session
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Session ID and User ID are required' },
        { status: 400 }
      );
    }

    const votes = await Vote.find({
      sessionId,
      voterUserId: userId
    });

    return NextResponse.json({
      success: true,
      votes
    });

  } catch (error) {
    console.error('Error fetching BET Awards votes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}
