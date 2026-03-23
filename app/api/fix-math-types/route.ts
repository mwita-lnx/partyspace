import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Award from '@/models/Award';
import Room from '@/models/Room';

/**
 * Temporary endpoint to fix game types for existing awards
 * POST /api/fix-math-types
 * Body: { roomId: string }
 */
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { roomId } = body;

    if (!roomId) {
      return NextResponse.json(
        { error: 'roomId is required' },
        { status: 400 }
      );
    }

    // Verify room exists and is a reaction game
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Get all awards for this room
    const awards = await Award.find({ sessionId: roomId }).sort({ order: 1 });

    const updates: any[] = [];

    // Update awards based on their title
    for (const award of awards) {
      const title = award.title.toLowerCase();
      let newType = award.type;

      // Detect game type from title
      if (title.includes('addition') || title === 'addition sprint') {
        newType = 'quick-math';
      } else if (title.includes('subtraction') || title === 'subtraction speed') {
        newType = 'quick-math';
      } else if (title.includes('multiplication') || title === 'multiplication madness') {
        newType = 'quick-math';
      } else if (title.includes('division') || title === 'division dash') {
        newType = 'quick-math';
      } else if (title.includes('mixed') || title === 'mixed operations') {
        newType = 'quick-math';
      } else if (title.includes('color')) {
        newType = 'color-match';
      } else if (title.includes('tap')) {
        newType = 'tap-battle';
      } else if (title.includes('word') || title.includes('type')) {
        newType = 'word-race';
      } else if (title.includes('memory') || title.includes('flash')) {
        newType = 'memory-flash';
      } else if (title.includes('reflex') || title.includes('reaction')) {
        newType = 'reflex-test';
      }

      // Update if type changed
      if (newType !== award.type) {
        await Award.findByIdAndUpdate(award._id, { type: newType });
        updates.push({
          id: award._id,
          title: award.title,
          oldType: award.type,
          newType: newType
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} awards`,
      updates: updates
    });

  } catch (error) {
    console.error('Fix math types error:', error);
    return NextResponse.json(
      { error: 'Failed to fix math types' },
      { status: 500 }
    );
  }
}
