import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import Vote from '@/models/Vote';
import GameScore from '@/models/GameScore';
import Participant from '@/models/Participant';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();
    const { roomId } = await params;
    const { searchParams } = new URL(request.url);
    const sessionIndexParam = searchParams.get('sessionIndex');

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Determine which session to show
    // If sessionIndex is specified, use that; otherwise use current session
    let sessionIndex = room.currentGameIndex >= 0 ? room.currentGameIndex : 0;
    if (sessionIndexParam !== null) {
      sessionIndex = parseInt(sessionIndexParam);
    }

    // Get all participants
    const participants = await Participant.find({ roomId });

    // Calculate scores for each participant
    const scoreMap = new Map<string, { participantId: string; participantName: string; score: number }>();

    // Initialize all participants with 0 score
    participants.forEach(participant => {
      scoreMap.set(participant._id.toString(), {
        participantId: participant._id.toString(),
        participantName: participant.name,
        score: 0
      });
    });

    // For reaction games, use GameScore model
    // For voting games, use Vote model
    if (room.category === 'reaction') {
      // Reaction games: sum scores from GameScore model for this session
      const gameScores = await GameScore.find({
        roomId,
        sessionIndex
      });

      gameScores.forEach(gameScore => {
        const participantId = gameScore.participantId.toString();
        if (scoreMap.has(participantId)) {
          const entry = scoreMap.get(participantId)!;
          entry.score += gameScore.score || 0;
        }
      });
    } else {
      // Voting games: count how many votes each participant received
      // Note: Vote model doesn't have sessionIndex yet, so this gets all votes
      const votes = await Vote.find({ roomId });

      votes.forEach(vote => {
        if (vote.nominee) {
          // Find participant by name
          const participant = participants.find(p => p.name === vote.nominee);
          if (participant) {
            const participantId = participant._id.toString();
            if (scoreMap.has(participantId)) {
              const entry = scoreMap.get(participantId)!;
              entry.score += 1;
            }
          }
        }
      });
    }

    // Convert to array and sort by score
    const leaderboard = Array.from(scoreMap.values())
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

    return NextResponse.json({
      leaderboard,
      gameType: room.gameType,
      category: room.category,
      status: room.status,
      sessionIndex: sessionIndex,
      totalSessions: room.gameSessions.length
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to get leaderboard' },
      { status: 500 }
    );
  }
}
