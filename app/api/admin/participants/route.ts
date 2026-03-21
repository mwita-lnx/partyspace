import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Participant from '@/models/Participant';

export async function GET() {
  try {
    await dbConnect();
    const participants = await Participant.find({}).sort({ createdAt: 1 });
    return NextResponse.json({ participants });
  } catch (error) {
    console.error('Fetch participants error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { name, code } = await request.json();

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }

    // Check if code already exists
    const existing = await Participant.findOne({ code: code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: 'Code already exists' }, { status: 400 });
    }

    const participant = await Participant.create({
      name,
      code: code.toUpperCase(),
      hasVoted: false
    });

    return NextResponse.json({ success: true, participant });
  } catch (error) {
    console.error('Create participant error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { id, name, code } = await request.json();

    if (!id || !name || !code) {
      return NextResponse.json({ error: 'ID, name and code are required' }, { status: 400 });
    }

    // Check if code already exists for a different participant
    const existing = await Participant.findOne({
      code: code.toUpperCase(),
      _id: { $ne: id }
    });
    if (existing) {
      return NextResponse.json({ error: 'Code already exists' }, { status: 400 });
    }

    const participant = await Participant.findByIdAndUpdate(
      id,
      { name, code: code.toUpperCase() },
      { new: true }
    );

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, participant });
  } catch (error) {
    console.error('Update participant error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await Participant.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete participant error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
