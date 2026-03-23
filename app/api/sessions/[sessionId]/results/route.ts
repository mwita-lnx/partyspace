import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Award from '@/models/Award';
import Vote from '@/models/Vote';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await connectDB();
    const { sessionId } = await params;

    // Fetch all awards for this session
    const awards = await Award.find({ sessionId }).sort({ order: 1 });

    // Fetch all votes for this session
    const votes = await Vote.find({ sessionId });

    // Calculate results for each award
    const results = awards.map((award) => {
      // Get votes for this specific award
      const awardVotes = votes.filter(
        (vote) => vote.awardId.toString() === award._id.toString()
      );

      // Count votes for each nominee
      const voteCounts: Record<string, number> = {};
      awardVotes.forEach((vote) => {
        const nominee = vote.nominee || vote.answer;
        if (nominee) {
          voteCounts[nominee] = (voteCounts[nominee] || 0) + 1;
        }
      });

      // Calculate total votes
      const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);

      // Create vote summary with percentages
      const votesSummary = Object.entries(voteCounts)
        .map(([nominee, count]) => ({
          nominee,
          count,
          percentage: totalVotes > 0 ? (count / totalVotes) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count); // Sort by vote count descending

      // Determine winner (highest votes)
      const winner = votesSummary.length > 0 ? votesSummary[0].nominee : null;

      return {
        awardId: award._id,
        awardTitle: award.title,
        awardEmoji: award.emoji,
        awardDescription: award.description,
        votes: votesSummary,
        totalVotes,
        winner
      };
    });

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
