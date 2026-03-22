import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import Participant from '@/models/Participant';
import Award from '@/models/Award';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();
    const { roomId } = await params;

    const room = await Room.findById(roomId);

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Get participants count
    const participantCount = await Participant.countDocuments({ roomId: room._id });

    // Get awards count
    const awardCount = await Award.countDocuments({ roomId: room._id });

    return NextResponse.json({
      room: {
        id: room._id,
        code: room.code,
        name: room.name,
        description: room.description,
        status: room.status,
        templateType: room.templateType,
        category: room.category,
        gameType: room.gameType,
        settings: room.settings,
        participantCount,
        awardCount,
        createdAt: room.createdAt,
        startedAt: room.startedAt,
        endedAt: room.endedAt
      }
    });

  } catch (error) {
    console.error('Get room error:', error);
    return NextResponse.json(
      { error: 'Failed to get room details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();
    const { roomId } = await params;
    const body = await request.json();

    const { status, settings } = body;

    const room = await Room.findById(roomId);

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Update status if provided
    if (status) {
      room.status = status;
      if (status === 'active' && !room.startedAt) {
        room.startedAt = new Date();
      } else if (status === 'ended' && !room.endedAt) {
        room.endedAt = new Date();
      }
    }

    // Update settings if provided
    if (settings) {
      room.settings = { ...room.settings, ...settings };
    }

    await room.save();

    return NextResponse.json({
      success: true,
      room: {
        id: room._id,
        code: room.code,
        name: room.name,
        status: room.status,
        category: room.category,
        gameType: room.gameType,
        settings: room.settings,
        startedAt: room.startedAt,
        endedAt: room.endedAt
      }
    });

  } catch (error) {
    console.error('Update room error:', error);
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    );
  }
}
