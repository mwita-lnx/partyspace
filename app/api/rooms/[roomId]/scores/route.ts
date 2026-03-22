import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GameScore from '@/models/GameScore';
import Room from '@/models/Room';
import Participant from '@/models/Participant';
import Award from '@/models/Award';

/**
 * POST /api/rooms/:roomId/scores
 * Submit a game score with flexible metrics
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();
    const { roomId } = await params;
    const body = await request.json();

    const { participantId, awardId, gameType, score, metrics, timeSpent, isCorrect } = body;

    // Validate required fields
    if (!participantId || !awardId || score === undefined) {
      return NextResponse.json(
        { error: 'participantId, awardId, and score are required' },
        { status: 400 }
      );
    }

    // Verify room, participant, and award exist
    const [room, participant, award] = await Promise.all([
      Room.findById(roomId),
      Participant.findById(participantId),
      Award.findById(awardId)
    ]);

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    if (!award) {
      return NextResponse.json(
        { error: 'Award/Challenge not found' },
        { status: 404 }
      );
    }

    // Get current session index from room
    const sessionIndex = room.currentGameIndex >= 0 ? room.currentGameIndex : 0;

    // Check if score already exists for this session (prevent duplicates)
    const existingScore = await GameScore.findOne({
      roomId,
      participantId,
      awardId,
      sessionIndex
    });

    if (existingScore) {
      // Update existing score
      existingScore.score = score;
      existingScore.metrics = metrics || {};
      existingScore.timeSpent = timeSpent || 0;
      existingScore.isCorrect = isCorrect;
      existingScore.completedAt = new Date();
      await existingScore.save();

      return NextResponse.json({
        success: true,
        score: existingScore,
        message: 'Score updated successfully'
      });
    }

    // Create new score entry with session tracking
    const gameScore = await GameScore.create({
      roomId,
      participantId,
      awardId,
      sessionIndex,
      gameType: gameType || award.type || 'unknown',
      score,
      metrics: metrics || {},
      timeSpent: timeSpent || 0,
      isCorrect
    });

    return NextResponse.json({
      success: true,
      score: gameScore,
      message: 'Score saved successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Submit score error:', error);
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/rooms/:roomId/scores
 * Get all scores for a room (optionally filtered by participant or award)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();
    const { roomId } = await params;
    const { searchParams } = new URL(request.url);

    const participantId = searchParams.get('participantId');
    const awardId = searchParams.get('awardId');
    const sessionIndexParam = searchParams.get('sessionIndex');

    const query: any = { roomId };
    if (participantId) query.participantId = participantId;
    if (awardId) query.awardId = awardId;

    // Filter by session if specified, otherwise get current session
    if (sessionIndexParam !== null) {
      query.sessionIndex = parseInt(sessionIndexParam);
    } else {
      // Default to current session
      const room = await Room.findById(roomId);
      if (room && room.currentGameIndex >= 0) {
        query.sessionIndex = room.currentGameIndex;
      }
    }

    const scores = await GameScore.find(query)
      .sort({ completedAt: -1 })
      .populate('participantId', 'name')
      .populate('awardId', 'title type');

    return NextResponse.json({
      success: true,
      scores
    });

  } catch (error) {
    console.error('Get scores error:', error);
    return NextResponse.json(
      { error: 'Failed to get scores' },
      { status: 500 }
    );
  }
}
