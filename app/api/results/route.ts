import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vote from '@/models/Vote';
import Award from '@/models/Award';

export async function GET() {
  try {
    await dbConnect();
    const awards = await Award.find({});

    const results = await Promise.all(
      awards.map(async (award) => {
        const votes = await Vote.find({ awardId: award._id });

        // Count votes for each nominee
        const voteCounts: Record<string, number> = {};
        votes.forEach((vote) => {
          voteCounts[vote.nominee] = (voteCounts[vote.nominee] || 0) + 1;
        });

        // Find winner (nominee with most votes)
        let winner = null;
        let maxVotes = 0;
        Object.entries(voteCounts).forEach(([nominee, count]) => {
          if (count > maxVotes) {
            maxVotes = count;
            winner = nominee;
          }
        });

        return {
          award: {
            id: award._id,
            title: award.title,
            emoji: award.emoji
          },
          totalVotes: votes.length,
          voteCounts,
          winner
        };
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Fetch results error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
