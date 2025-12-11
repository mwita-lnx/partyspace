import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Participant from '@/models/Participant';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { participantId } = await request.json();

    if (!participantId) {
      return NextResponse.json({ error: 'Participant ID required' }, { status: 400 });
    }

    const participant = await Participant.findByIdAndUpdate(
      participantId,
      { hasVoted: true, votedAt: new Date() },
      { new: true }
    );

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark voted error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
