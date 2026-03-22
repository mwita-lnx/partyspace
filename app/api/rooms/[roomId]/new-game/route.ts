import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import Award from '@/models/Award';
import Vote from '@/models/Vote';
import { getGameTemplate } from '@/lib/gameTemplates';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();
    const { roomId } = await params;
    const body = await request.json();

    const { gameType, category = 'custom' } = body;

    if (!gameType) {
      return NextResponse.json(
        { error: 'Game type is required' },
        { status: 400 }
      );
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Complete the current game session if active
    if (room.currentGameIndex >= 0 && room.gameSessions[room.currentGameIndex]) {
      const currentSession = room.gameSessions[room.currentGameIndex];
      if (currentSession.status === 'active') {
        currentSession.status = 'completed';
        currentSession.endedAt = new Date();
      }
    }

    // Create new game session
    const newSession = {
      gameType,
      category,
      startedAt: new Date(),
      status: 'active' as const
    };

    room.gameSessions.push(newSession);
    room.currentGameIndex = room.gameSessions.length - 1;
    room.status = 'active';
    room.gameType = gameType;
    room.category = category;

    await room.save();

    // Delete old awards/votes from previous game
    await Award.deleteMany({ roomId: room._id });
    await Vote.deleteMany({ roomId: room._id });

    // Reset participant votes
    const Participant = require('@/models/Participant').default;
    await Participant.updateMany(
      { roomId: room._id },
      { hasVoted: false }
    );

    // Create new questions from template
    if (gameType !== 'custom') {
      const template = getGameTemplate(gameType);
      if (template && template.questions.length > 0) {
        const awards = template.questions.map((question, index) => ({
          roomId: room._id,
          title: question.title,
          description: question.description,
          emoji: question.emoji,
          nominees: [],
          order: index,
          type: question.type || 'voting',
          options: question.options,
          correctAnswer: question.correctAnswer,
          timeLimit: question.timeLimit
        }));
        await Award.insertMany(awards);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'New game started',
      room: {
        id: room._id,
        code: room.code,
        name: room.name,
        gameType: room.gameType,
        category: room.category,
        status: room.status,
        currentGameIndex: room.currentGameIndex,
        gameSessions: room.gameSessions
      }
    }, { status: 201 });

  } catch (error) {
    console.error('New game error:', error);
    return NextResponse.json(
      { error: 'Failed to start new game' },
      { status: 500 }
    );
  }
}
