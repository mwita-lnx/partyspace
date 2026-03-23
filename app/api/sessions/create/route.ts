import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GameSession from '@/models/GameSession';
import Award from '@/models/Award';
import { getSession } from '@/lib/auth';
import { getGameTemplate } from '@/lib/gameTemplates';

function generatePIN(): string {
  // Generate 4-digit PIN (1000-9999)
  const pin = Math.floor(1000 + Math.random() * 9000);
  return pin.toString();
}

export async function POST(request: Request) {
  try {
    // Require authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required to create a game session' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();

    const { name, description, hostName, gameType = 'bet-awards' } = body;

    // Validation
    if (!name || !hostName) {
      return NextResponse.json(
        { error: 'Session name and host name are required' },
        { status: 400 }
      );
    }

    // Generate unique PIN
    let code = generatePIN();
    let codeExists = await GameSession.findOne({ code });
    while (codeExists) {
      code = generatePIN();
      codeExists = await GameSession.findOne({ code });
    }

    // Create game session
    const gameSession = await GameSession.create({
      code,
      name,
      description,
      hostUserId: session.userId,
      hostName,
      gameType,
      status: 'waiting',
      settings: {
        showLiveResults: false,
        maxParticipants: 50
      }
    });

    // Create default BET Awards categories
    if (gameType === 'bet-awards') {
      const template = getGameTemplate('bet-awards');
      if (template && template.questions.length > 0) {
        const awards = template.questions.map((question, index) => ({
          sessionId: gameSession._id,
          title: question.title,
          description: question.description,
          emoji: question.emoji,
          nominees: [], // Empty initially - host will add nominees
          order: index,
          type: 'voting',
          timeLimit: question.timeLimit || 30
        }));
        await Award.insertMany(awards);
      }
    }

    return NextResponse.json({
      success: true,
      session: {
        id: gameSession._id,
        code: gameSession.code,
        name: gameSession.name,
        description: gameSession.description,
        status: gameSession.status,
        gameType: gameSession.gameType,
        hostName: gameSession.hostName,
        settings: gameSession.settings
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create game session' },
      { status: 500 }
    );
  }
}
