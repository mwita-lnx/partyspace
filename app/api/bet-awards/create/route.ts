import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import Participant from '@/models/Participant';
import Award from '@/models/Award';
import { getSession } from '@/lib/auth';
import { getGameTemplate } from '@/lib/gameTemplates';

function generateRoomCode(): string {
  // Generate 4-digit PIN (1000-9999)
  const pin = Math.floor(1000 + Math.random() * 9000);
  return pin.toString();
}

export async function POST(request: Request) {
  try {
    // Require authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required to create a room' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();

    const { name, description, hostName } = body;

    // Validation
    if (!name || !hostName) {
      return NextResponse.json(
        { error: 'Room name and host name are required' },
        { status: 400 }
      );
    }

    // Generate unique room code
    let code = generateRoomCode();
    let codeExists = await Room.findOne({ code });
    while (codeExists) {
      code = generateRoomCode();
      codeExists = await Room.findOne({ code });
    }

    // Create host participant
    const hostCode = generateRoomCode();
    const tempRoomId = new (require('mongoose').Types.ObjectId)();

    const host = await Participant.create({
      name: hostName,
      code: hostCode,
      roomId: tempRoomId,
      isHost: true,
      hasVoted: false
    });

    // Create room
    const room = await Room.create({
      _id: tempRoomId,
      code,
      name,
      description,
      hostId: host._id,
      userId: session.userId, // Link to authenticated user
      gameType: 'bet-awards',
      category: 'awards',
      status: 'waiting',
      settings: {
        allowLateJoin: true,
        showLiveResults: false,
        maxParticipants: 50,
        votesPerAward: 1 // Each person can vote once per award
      }
    });

    // Initialize game session
    room.gameSessions = [{
      gameType: 'bet-awards',
      category: 'awards',
      startedAt: new Date(),
      status: 'active'
    }];
    room.currentGameIndex = 0;
    await room.save();

    // Create default BET Awards categories
    const template = getGameTemplate('bet-awards');
    if (template && template.questions.length > 0) {
      const awards = template.questions.map((question, index) => ({
        roomId: room._id,
        title: question.title,
        description: question.description,
        emoji: question.emoji,
        nominees: [], // Empty initially - host will add nominees
        order: index,
        type: 'voting',
        timeLimit: question.timeLimit || 30
      }));
      await Award.insertMany(awards);
    }

    return NextResponse.json({
      success: true,
      room: {
        id: room._id,
        code: room.code,
        name: room.name,
        description: room.description,
        status: room.status,
        gameType: room.gameType,
        category: room.category,
        settings: room.settings
      },
      host: {
        id: host._id,
        name: host.name,
        code: host.code,
        isHost: true
      }
    }, { status: 201 });

  } catch (error) {
    console.error('BET Awards room creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
