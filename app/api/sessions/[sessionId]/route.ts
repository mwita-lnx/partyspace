import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GameSession from '@/models/GameSession';

// GET - Fetch session by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await connectDB();
    const { sessionId } = await params;

    const session = await GameSession.findById(sessionId);

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
        settings: session.settings,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
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

// PATCH - Update session (status, name, description, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await connectDB();
    const { sessionId } = await params;
    const body = await request.json();

    const session = await GameSession.findById(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (body.status !== undefined) session.status = body.status;
    if (body.name !== undefined) session.name = body.name;
    if (body.description !== undefined) session.description = body.description;
    if (body.settings !== undefined) session.settings = body.settings;

    await session.save();

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
        settings: session.settings,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      },
      message: 'Session updated successfully'
    });

  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE - Delete session
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await connectDB();
    const { sessionId } = await params;

    const session = await GameSession.findByIdAndDelete(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
