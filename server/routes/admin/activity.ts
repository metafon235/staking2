import { Router } from 'express';
import { db } from '@db';
import { activityLogs, activityMetrics, stakes, users, transactions } from '@db/schema';
import { desc, sql, count, sum } from 'drizzle-orm';

const router = Router();

// Get recent activity logs
router.get('/logs', async (_req, res) => {
  try {
    const logs = await db.query.activityLogs.findMany({
      orderBy: desc(activityLogs.createdAt),
      limit: 100
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: "Failed to fetch activity logs" });
  }
});

// Get metrics for graphs
router.get('/metrics', async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    let dateFilter;
    switch(period) {
      case '30d':
        dateFilter = sql`date >= NOW() - INTERVAL '30 days'`;
        break;
      case '90d':
        dateFilter = sql`date >= NOW() - INTERVAL '90 days'`;
        break;
      case '7d':
      default:
        dateFilter = sql`date >= NOW() - INTERVAL '7 days'`;
    }

    const metrics = await db.query.activityMetrics.findMany({
      where: dateFilter,
      orderBy: activityMetrics.date
    });

    // Get current day metrics with real-time APY difference calculation
    const [currentMetrics] = await db.select({
      totalValueLocked: sum(stakes.amount),
      userCount: count(users.id),
      activeStakes: count(stakes.id)
    })
    .from(stakes)
    .where(sql`${stakes.status} = 'active'`);

    // Calculate admin rewards based on APY difference (3.57% - 3% = 0.57%)
    const apyDifference = 0.0057; // 0.57%
    const yearInMinutes = 365 * 24 * 60;
    const minutelyRate = apyDifference / yearInMinutes;

    // Calculate admin rewards based on TVL and time passed
    const realTimeAdminRewards = currentMetrics.totalValueLocked 
      ? parseFloat(currentMetrics.totalValueLocked.toString()) * minutelyRate * 60 // Last hour's rewards
      : 0;

    res.json({
      historical: metrics,
      current: {
        ...currentMetrics,
        adminRewards: realTimeAdminRewards,
        apyDifference: 0.57,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching activity metrics:', error);
    res.status(500).json({ message: "Failed to fetch activity metrics" });
  }
});

export default router;