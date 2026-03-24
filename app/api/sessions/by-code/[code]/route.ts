import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GameSession from '@/models/GameSession';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await connectDB();
    const { code } = await params;

    const session = await GameSession.findOne({ code: code.toUpperCase() });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session._id,
        code: session.code,
        name: session.name,
        description: session.description,
        status: session.status,
        gameType: session.gameType,
        hostName: session.hostName,
        hostUserId: session.hostUserId.toString(),
        settings: session.settings
      }
    });

  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
