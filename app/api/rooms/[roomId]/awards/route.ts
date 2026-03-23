import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Award from '@/models/Award';
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

    // Get all awards for this room
    const awards = await Award.find({ sessionId: roomId })
      .sort({ order: 1 })
      .select('title description emoji nominees order type timeLimit');

    return NextResponse.json({
      awards: awards.map(a => ({
        _id: a._id.toString(),
        id: a._id,
        title: a.title,
        description: a.description,
        emoji: a.emoji,
        nominees: a.nominees,
        order: a.order,
        type: a.type,
        timeLimit: a.timeLimit
      }))
    });

  } catch (error) {
    console.error('Get awards error:', error);
    return NextResponse.json(
      { error: 'Failed to get awards' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await connectDB();
    const { roomId } = await params;
    const body = await request.json();

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Don't allow adding awards once voting has started
    if (room.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Cannot add awards after voting has started' },
        { status: 400 }
      );
    }

    const { title, description, emoji = '🏆', nominees = [], type, timeLimit, order: bodyOrder } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Get current max order or use provided order
    let order = bodyOrder;
    if (order === undefined) {
      const maxOrderAward = await Award.findOne({ sessionId: roomId }).sort({ order: -1 });
      order = maxOrderAward ? maxOrderAward.order + 1 : 0;
    }

    const award = await Award.create({
      sessionId: roomId,
      title,
      description,
      emoji,
      nominees,
      order,
      type,
      timeLimit
    });

    return NextResponse.json({
      success: true,
      award: {
        _id: award._id.toString(),
        id: award._id,
        title: award.title,
        description: award.description,
        emoji: award.emoji,
        nominees: award.nominees,
        order: award.order,
        type: award.type,
        timeLimit: award.timeLimit
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create award error:', error);
    return NextResponse.json(
      { error: 'Failed to create award' },
      { status: 500 }
    );
  }
}
