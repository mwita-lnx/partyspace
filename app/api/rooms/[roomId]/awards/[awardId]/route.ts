import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Award from '@/models/Award';
import Room from '@/models/Room';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roomId: string; awardId: string }> }
) {
  try {
    await connectDB();
    const { roomId, awardId } = await params;
    const body = await request.json();

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Don't allow editing awards once voting has started
    if (room.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Cannot edit awards after voting has started' },
        { status: 400 }
      );
    }

    // Find award and verify it belongs to this room
    const award = await Award.findOne({ _id: awardId, roomId });
    if (!award) {
      return NextResponse.json(
        { error: 'Award not found in this room' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const { title, description, emoji, nominees } = body;
    if (title) award.title = title;
    if (description) award.description = description;
    if (emoji) award.emoji = emoji;
    if (nominees) award.nominees = nominees;

    await award.save();

    return NextResponse.json({
      success: true,
      award: {
        id: award._id,
        title: award.title,
        description: award.description,
        emoji: award.emoji,
        nominees: award.nominees,
        order: award.order
      }
    });

  } catch (error) {
    console.error('Update award error:', error);
    return NextResponse.json(
      { error: 'Failed to update award' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ roomId: string; awardId: string }> }
) {
  try {
    await connectDB();
    const { roomId, awardId } = await params;

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Don't allow deleting awards once voting has started
    if (room.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Cannot delete awards after voting has started' },
        { status: 400 }
      );
    }

    // Find and delete award (only if it belongs to this room)
    const result = await Award.deleteOne({ _id: awardId, roomId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Award not found in this room' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Award deleted successfully'
    });

  } catch (error) {
    console.error('Delete award error:', error);
    return NextResponse.json(
      { error: 'Failed to delete award' },
      { status: 500 }
    );
  }
}
