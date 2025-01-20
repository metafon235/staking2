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
    const now = new Date();

    switch(period) {
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '7d':
      default:
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get historical data
    const metrics = await db.query.activityMetrics.findMany({
      where: sql`date >= ${dateFilter}`,
      orderBy: activityMetrics.date
    });

    // Get current metrics with real-time data
    const [currentStakes] = await db.select({
      totalValueLocked: sum(stakes.amount),
      activeStakes: count(stakes.id)
    })
    .from(stakes)
    .where(sql`${stakes.status} = 'active'`);

    // Get user count
    const [userCount] = await db.select({
      count: count()
    })
    .from(users);

    // Calculate real-time admin rewards based on TVL
    const apyDifference = 0.0057; // 0.57% (3.57% - 3%)
    const yearInMinutes = 365 * 24 * 60;
    const minutelyRate = apyDifference / yearInMinutes;
    const tvl = parseFloat(currentStakes.totalValueLocked?.toString() || '0');

    // Calculate accumulated rewards since start of day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const minutesSinceStartOfDay = (now.getTime() - startOfDay.getTime()) / (60 * 1000);

    const accumulatedDailyRewards = tvl * minutelyRate * minutesSinceStartOfDay;

    // Calculate historical APY rewards
    const historicalData = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);

      return {
        date: date.toISOString(),
        totalValueLocked: tvl.toString(),
        userCount: userCount.count,
        activeStakes: currentStakes.activeStakes || 0,
        adminRewards: (tvl * minutelyRate * 1440).toString() // Daily rewards
      };
    });

    res.json({
      historical: historicalData,
      current: {
        totalValueLocked: tvl.toString(),
        userCount: userCount.count,
        activeStakes: currentStakes.activeStakes || 0,
        adminRewards: accumulatedDailyRewards,
        apyDifference: 0.57,
        lastUpdated: now.toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching activity metrics:', error);
    res.status(500).json({ message: "Failed to fetch activity metrics" });
  }
});

export default router;