import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import UserSession from '@/models/UserSession';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionCode } = body;

    if (!sessionCode) {
      return NextResponse.json({ error: 'Session code is required' }, { status: 400 });
    }

    await dbConnect();

    // Find user by email to get userId
    const User = (await import('@/models/User')).default;
    const user = await User.findOne({ email: session.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete the user session by sessionCode and userId
    const result = await UserSession.findOneAndDelete({
      userId: user._id,
      sessionCode: sessionCode
    });

    if (!result) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Session removed from history' });
  } catch (error) {
    console.error('Error deleting user session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
