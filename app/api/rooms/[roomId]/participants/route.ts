import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Participant from '@/models/Participant';
import Room from '@/models/Room';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();
    const { roomId } = await params;

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Get all participants in the room
    const participants = await Participant.find({ roomId })
      .sort({ isHost: -1, createdAt: 1 }) // Host first, then by join order
      .select('name code isHost hasVoted votedAt createdAt');

    return NextResponse.json({
      participants: participants.map(p => ({
        id: p._id,
        name: p.name,
        code: p.code,
        isHost: p.isHost,
        hasVoted: p.hasVoted,
        votedAt: p.votedAt,
        joinedAt: p.createdAt
      }))
    });

  } catch (error) {
    console.error('Get participants error:', error);
    return NextResponse.json(
      { error: 'Failed to get participants' },
      { status: 500 }
    );
  }
}
