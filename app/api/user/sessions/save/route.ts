import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import UserSession from '@/models/UserSession';
import GameSession from '@/models/GameSession';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionCode, sessionName, role, sessionId } = body;

    if (!sessionCode || !sessionName || !role || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Find user by email to get userId
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the game session to get its ObjectId
    const gameSession = await GameSession.findById(sessionId);
    if (!gameSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update or create user session
    const userSession = await UserSession.findOneAndUpdate(
      { userId: user._id, sessionId: gameSession._id },
      {
        userId: user._id,
        sessionId: gameSession._id,
        sessionCode,
        sessionName,
        role,
        lastAccessedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, userSession });
  } catch (error) {
    console.error('Error saving user session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
