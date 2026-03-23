import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Award from '@/models/Award';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string; awardId: string }> }
) {
  try {
    await connectDB();
    const { sessionId, awardId } = await params;
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
        sessionId: sessionId
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
      award
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

    const result = await Award.deleteOne({
      _id: awardId,
      sessionId: sessionId
    });

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
