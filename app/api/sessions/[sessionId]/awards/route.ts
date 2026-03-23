import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Award from '@/models/Award';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await connectDB();
    const { sessionId } = await params;

    const awards = await Award.find({ sessionId }).sort({ order: 1 });

    return NextResponse.json({
      success: true,
      awards
    });

  } catch (error) {
    console.error('Error fetching awards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch awards' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await connectDB();
    const { sessionId } = await params;
    const body = await request.json();

    const { title, description, emoji, type, timeLimit, order } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Award title is required' },
        { status: 400 }
      );
    }

    const award = await Award.create({
      sessionId,
      title,
      description: description || `Vote for ${title}`,
      emoji: emoji || '🏆',
      nominees: [],
      order: order !== undefined ? order : 0,
      type: type || 'voting',
      timeLimit: timeLimit || 30
    });

    return NextResponse.json({
      success: true,
      award
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating award:', error);
    return NextResponse.json(
      { error: 'Failed to create award' },
      { status: 500 }
    );
  }
}
