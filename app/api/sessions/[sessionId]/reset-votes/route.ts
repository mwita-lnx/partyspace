import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vote from '@/models/Vote';

/**
 * DELETE /api/sessions/[sessionId]/reset-votes
 * Host-only action: wipe all votes for the session so voters can start fresh.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await connectDB();
    const { sessionId } = await params;

    const result = await Vote.deleteMany({ sessionId });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Reset ${result.deletedCount} vote(s) for this session.`,
    });
  } catch (error) {
    console.error('Error resetting votes:', error);
    return NextResponse.json(
      { error: 'Failed to reset votes' },
      { status: 500 }
    );
  }
}
