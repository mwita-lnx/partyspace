import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AppInstallation from '@/models/AppInstallation';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { deviceInfo, installSource } = body;

    // Get user session if authenticated (optional)
    const session = await getSession();
    const userId = session?.userId;

    // Create installation record
    const installation = await AppInstallation.create({
      userId,
      installDate: new Date(),
      deviceInfo,
      installSource,
      isUninstalled: false
    });

    return NextResponse.json({
      success: true,
      installationId: installation._id
    }, { status: 201 });

  } catch (error) {
    console.error('App installation tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track app installation' },
      { status: 500 }
    );
  }
}

// Get installation statistics
export async function GET(request: Request) {
  try {
    await connectDB();

    // Require authentication for viewing stats
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const totalInstalls = await AppInstallation.countDocuments({ isUninstalled: false });
    const totalUninstalls = await AppInstallation.countDocuments({ isUninstalled: true });
    const activeInstalls = totalInstalls - totalUninstalls;

    // Group by install source
    const bySource = await AppInstallation.aggregate([
      { $match: { isUninstalled: false } },
      { $group: { _id: '$installSource', count: { $sum: 1 } } }
    ]);

    // Get recent installations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentInstalls = await AppInstallation.countDocuments({
      installDate: { $gte: thirtyDaysAgo },
      isUninstalled: false
    });

    // Daily installs for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyInstalls = await AppInstallation.aggregate([
      {
        $match: {
          installDate: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$installDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalInstalls,
        activeInstalls,
        totalUninstalls,
        recentInstalls,
        bySource,
        dailyInstalls
      }
    });

  } catch (error) {
    console.error('Failed to fetch installation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch installation statistics' },
      { status: 500 }
    );
  }
}
