import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import UserSession from '@/models/UserSession';
import GameSession from '@/models/GameSession';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find user by email to get userId
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's session history
    const userSessions = await UserSession.find({ userId: user._id })
      .sort({ lastAccessedAt: -1 })
      .limit(50)
      .lean();

    // Enrich with current session status
    const enrichedSessions = await Promise.all(
      userSessions.map(async (us) => {
        const gameSession = await GameSession.findById(us.sessionId).lean();
        return {
          code: us.sessionCode,
          name: us.sessionName,
          role: us.role,
          createdAt: us.joinedAt,
          status: gameSession?.status || 'unknown',
          sessionId: us.sessionId
        };
      })
    );

    return NextResponse.json({ sessions: enrichedSessions });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
