import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vote from '@/models/Vote';
import Participant from '@/models/Participant';

export async function POST() {
  try {
    await dbConnect();

    // Delete all votes
    const deleteResult = await Vote.deleteMany({});
    const deletedVotes = deleteResult.deletedCount;

    // Reset all participants' voting status
    const updateResult = await Participant.updateMany(
      {},
      {
        $set: {
          hasVoted: false
        },
        $unset: {
          votedAt: ""
        }
      }
    );
    const participantsReset = updateResult.modifiedCount;

    return NextResponse.json({
      success: true,
      deletedVotes,
      participantsReset,
      message: 'Voting reset successfully'
    });
  } catch (error) {
    console.error('Reset voting error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
