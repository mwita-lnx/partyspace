import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vote from '@/models/bet-awards/Vote';

/**
 * BET Awards Reset Votes API
 * Deletes all votes for a specific session
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await connectDB();
    const { sessionId } = await params;

    // Delete all votes for this session
    const deleteResult = await Vote.deleteMany({ sessionId });
    const deletedCount = deleteResult.deletedCount || 0;

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Successfully deleted ${deletedCount} vote(s)`
    });

  } catch (error) {
    console.error('Error resetting votes:', error);
    return NextResponse.json(
      { error: 'Failed to reset votes' },
      { status: 500 }
    );
  }
}
