import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Participant from '@/models/Participant';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Access code is required' }, { status: 400 });
    }

    const participant = await Participant.findOne({ code: code.toUpperCase() });

    if (!participant) {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      participant: {
        id: participant._id,
        name: participant.name,
        hasVoted: participant.hasVoted
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
