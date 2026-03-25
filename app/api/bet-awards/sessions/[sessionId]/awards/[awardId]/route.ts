import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Award from '@/models/bet-awards/Award';

/**
 * BET Awards API - Individual Award Management
 * Get, update, and delete a specific award
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string; awardId: string }> }
) {
  try {
    await connectDB();
    const { sessionId, awardId } = await params;

    const award = await Award.findOne({ _id: awardId, sessionId });

    if (!award) {
      return NextResponse.json(
        { error: 'Award not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      award
    });

  } catch (error) {
    console.error('Error fetching award:', error);
    return NextResponse.json(
      { error: 'Failed to fetch award' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string; awardId: string }> }
) {
  try {
    await connectDB();
    const { sessionId, awardId } = await params;
    const body = await request.json();

    const award = await Award.findOne({ _id: awardId, sessionId });

    if (!award) {
      return NextResponse.json(
        { error: 'Award not found' },
        { status: 404 }
      );
    }

    // Update only allowed fields
    if (body.title !== undefined) award.title = body.title;
    if (body.description !== undefined) award.description = body.description;
    if (body.emoji !== undefined) award.emoji = body.emoji;
    if (body.nominees !== undefined) award.nominees = body.nominees;
    if (body.order !== undefined) award.order = body.order;
    if (body.type !== undefined) award.type = body.type;
    if (body.timeLimit !== undefined) award.timeLimit = body.timeLimit;

    await award.save();

    return NextResponse.json({
      success: true,
      award,
      message: 'Award updated successfully'
    });

  } catch (error) {
    console.error('Error updating award:', error);
    return NextResponse.json(
      { error: 'Failed to update award' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sessionId: string; awardId: string }> }
) {
  try {
    await connectDB();
    const { sessionId, awardId } = await params;

    const result = await Award.deleteOne({ _id: awardId, sessionId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Award not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Award deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting award:', error);
    return NextResponse.json(
      { error: 'Failed to delete award' },
      { status: 500 }
    );
  }
}
