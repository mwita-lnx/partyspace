import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Award from '@/models/Award';

/**
 * Simple endpoint to update all "speed-challenge" types to their proper game types
 * GET /api/fix-types?roomId=YOUR_ROOM_ID
 */
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json(
        { error: 'roomId query parameter is required' },
        { status: 400 }
      );
    }

    // Get all awards with speed-challenge type
    const awards = await Award.find({
      roomId,
      type: 'speed-challenge'
    }).sort({ order: 1 });

    const updates: any[] = [];

    for (const award of awards) {
      const title = award.title.toLowerCase();
      let newType = 'tap-battle'; // default

      // Detect game type from title
      if (title.includes('math') || title.includes('addition') || title.includes('subtraction') ||
          title.includes('multiplication') || title.includes('division') || title.includes('mixed')) {
        newType = 'quick-math';
      } else if (title.includes('color') || title.includes('red') || title.includes('blue') ||
                 title.includes('green') || title.includes('rainbow')) {
        newType = 'color-match';
      } else if (title.includes('word') || title.includes('type') || title.includes('race')) {
        newType = 'word-race';
      } else if (title.includes('memory') || title.includes('flash') || title.includes('sequence')) {
        newType = 'memory-flash';
      } else if (title.includes('reflex') || title.includes('reaction')) {
        newType = 'reflex-test';
      }

      // Update
      await Award.findByIdAndUpdate(award._id, { type: newType });
      updates.push({
        title: award.title,
        oldType: 'speed-challenge',
        newType: newType
      });
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} awards from 'speed-challenge' to specific game types`,
      updates: updates
    });

  } catch (error) {
    console.error('Fix types error:', error);
    return NextResponse.json(
      { error: 'Failed to fix types', details: String(error) },
      { status: 500 }
    );
  }
}
