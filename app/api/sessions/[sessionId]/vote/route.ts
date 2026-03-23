import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vote from '@/models/Vote';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await connectDB();
    const { sessionId } = await params;
    const body = await request.json();

    const { voterName, voterEmail, awardId, nominee, answer, ranking, timeSpent, isCorrect } = body;

    // Validation
    if (!voterName || !awardId) {
      return NextResponse.json(
        { error: 'Voter name and award ID are required' },
        { status: 400 }
      );
    }

    // Check if vote already exists
    const existingVote = await Vote.findOne({
      sessionId,
      voterName,
      awardId
    });

    if (existingVote) {
      // Update existing vote
      existingVote.nominee = nominee;
      existingVote.answer = answer;
      existingVote.ranking = ranking;
      existingVote.timeSpent = timeSpent;
      existingVote.isCorrect = isCorrect;
      if (voterEmail) existingVote.voterEmail = voterEmail;

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
      voterName,
      voterEmail,
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

  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}
