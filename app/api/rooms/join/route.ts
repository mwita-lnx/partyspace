import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import Participant from '@/models/Participant';

function generateParticipantCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const { roomCode, participantName } = body;

    // Validation
    if (!roomCode || !participantName) {
      return NextResponse.json(
        { error: 'Room code and participant name are required' },
        { status: 400 }
      );
    }

    // Find room
    const room = await Room.findOne({ code: roomCode.toUpperCase() });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found. Please check the room code.' },
        { status: 404 }
      );
    }

    // Check if room is full
    const participantCount = await Participant.countDocuments({ roomId: room._id });
    if (participantCount >= room.settings.maxParticipants) {
      return NextResponse.json(
        { error: 'Room is full. Maximum participants reached.' },
        { status: 400 }
      );
    }

    // Check if room has ended
    if (room.status === 'ended') {
      return NextResponse.json(
        { error: 'This room has ended. You can view results only.' },
        { status: 400 }
      );
    }

    // Check if late join is allowed
    if (room.status === 'active' && !room.settings.allowLateJoin) {
      return NextResponse.json(
        { error: 'Late joining is not allowed for this room.' },
        { status: 400 }
      );
    }

    // Generate unique participant code for this room
    let participantCode = generateParticipantCode();
    let codeExists = await Participant.findOne({ code: participantCode, roomId: room._id });
    while (codeExists) {
      participantCode = generateParticipantCode();
      codeExists = await Participant.findOne({ code: participantCode, roomId: room._id });
    }

    // Create participant
    const participant = await Participant.create({
      name: participantName,
      code: participantCode,
      roomId: room._id,
      isHost: false,
      hasVoted: false
    });

    return NextResponse.json({
      success: true,
      participant: {
        id: participant._id,
        name: participant.name,
        code: participant.code,
        isHost: false,
        hasVoted: false
      },
      room: {
        id: room._id,
        code: room.code,
        name: room.name,
        description: room.description,
        status: room.status,
        settings: room.settings
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Room join error:', error);
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    );
  }
}
