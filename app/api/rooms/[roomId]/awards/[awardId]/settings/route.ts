import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Award from '@/models/Award';

/**
 * GET /api/rooms/:roomId/awards/:awardId/settings
 * Get game settings for a specific award
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string; awardId: string }> }
) {
  try {
    await connectDB();
    const { roomId, awardId } = await params;

    const award = await Award.findOne({
      _id: awardId,
      roomId: roomId
    });

    if (!award) {
      return NextResponse.json(
        { error: 'Award not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: award.gameSettings || {}
    });

  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/rooms/:roomId/awards/:awardId/settings
 * Update game settings for a specific award
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ roomId: string; awardId: string }> }
) {
  try {
    await connectDB();
    const { roomId, awardId } = await params;
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Settings object is required' },
        { status: 400 }
      );
    }

    const award = await Award.findOneAndUpdate(
      {
        _id: awardId,
        roomId: roomId
      },
      {
        $set: { gameSettings: settings }
      },
      { new: true }
    );

    if (!award) {
      return NextResponse.json(
        { error: 'Award not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: award.gameSettings,
      message: 'Settings saved successfully'
    });

  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/rooms/:roomId/awards/:awardId/settings
 * Update nominees for a specific award
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roomId: string; awardId: string }> }
) {
  try {
    await connectDB();
    const { roomId, awardId } = await params;
    const body = await request.json();
    const { nominees } = body;

    if (!Array.isArray(nominees)) {
      return NextResponse.json(
        { error: 'Nominees must be an array' },
        { status: 400 }
      );
    }

    const award = await Award.findOneAndUpdate(
      {
        _id: awardId,
        roomId: roomId
      },
      {
        $set: { nominees }
      },
      { new: true }
    );

    if (!award) {
      return NextResponse.json(
        { error: 'Award not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      nominees: award.nominees,
      message: 'Nominees updated successfully'
    });

  } catch (error) {
    console.error('Update nominees error:', error);
    return NextResponse.json(
      { error: 'Failed to update nominees' },
      { status: 500 }
    );
  }
}
