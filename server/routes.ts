import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { z } from "zod";
import { store } from "./store";
import { setupAuth } from "./auth";
import { stakes, rewards, transactions } from "@db/schema";
import { eq, count, avg, sql } from "drizzle-orm";

// Network base statistics
const BASE_STATS = {
  eth: {
    tvl: 2456789.45,
    validators: 845632,
    avgStake: 32.5,
    rewards: 74563.21
  },
  dot: {
    tvl: 789456.12,
    validators: 297845,
    avgStake: 125.8,
    rewards: 28945.67
  },
  sol: {
    tvl: 567123.89,
    validators: 156789,
    avgStake: 845.2,
    rewards: 15678.34
  }
};

// Generate sample historical data for a coin
function generateHistoricalData(baseStats: typeof BASE_STATS[keyof typeof BASE_STATS]) {
  const now = Date.now();
  const data = [];

  // Generate data points for the last 30 days
  for (let i = 30; i >= 0; i--) {
    const date = now - (i * 24 * 60 * 60 * 1000);
    // Add some random variation to make the data look realistic
    const variation = () => 1 + (Math.random() * 0.1 - 0.05); // ±5% variation

    data.push({
      date,
      tvl: baseStats.tvl * variation(),
      validators: Math.floor(baseStats.validators * variation()),
      avgStake: baseStats.avgStake * variation(),
      rewards: baseStats.rewards * variation(),
    });
  }

  return data;
}

// Network statistics for each coin
const NETWORK_STATS = {
  eth: {
    current: BASE_STATS.eth,
    history: generateHistoricalData(BASE_STATS.eth)
  },
  dot: {
    current: BASE_STATS.dot,
    history: generateHistoricalData(BASE_STATS.dot)
  },
  sol: {
    current: BASE_STATS.sol,
    history: generateHistoricalData(BASE_STATS.sol)
  }
};

// Validation schema for stake request
const stakeRequestSchema = z.object({
  amount: z.string().refine((val) => {
    const amount = parseFloat(val);
    return !isNaN(amount) && amount >= 0.01;
  }, {
    message: "Minimum stake amount is 0.01 ETH"
  })
});

// Calculate rewards based on 3% APY for a specific time period
function calculateRewardsForTimestamp(stakedAmount: number, startTimeMs: number, endTimeMs: number): number {
  const timePassedMs = endTimeMs - startTimeMs;
  const yearsElapsed = timePassedMs / (365 * 24 * 60 * 60 * 1000);
  return stakedAmount * 0.03 * yearsElapsed; // 3% APY
}

// Generate rewards history based on time range
function generateRewardsHistory(totalStaked: number, startTime: number): Array<{ timestamp: number; rewards: number }> {
  const history = [];
  const now = Date.now();
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const intervalMinutes = 5; // Data points every 5 minutes

  // Generate data points with progressive rewards calculation
  for (let timestamp = oneWeekAgo; timestamp <= now; timestamp += intervalMinutes * 60 * 1000) {
    const rewards = calculateRewardsForTimestamp(totalStaked, startTime, timestamp);
    history.push({
      timestamp,
      rewards: parseFloat(rewards.toFixed(9)) // 9 decimal precision
    });
  }

  return history;
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Get staking overview data
  app.get('/api/staking/data', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get user's total staked amount and earliest stake
      const userStakes = await db.query.stakes.findMany({
        where: eq(stakes.userId, req.user.id),
        orderBy: (stakes, { asc }) => [asc(stakes.createdAt)]
      });

      const totalStaked = userStakes.reduce((sum, stake) =>
        sum + parseFloat(stake.amount.toString()), 0);

      if (totalStaked < 0.01) {
        return res.json({
          totalStaked: 0,
          rewards: 0,
          monthlyRewards: 0,
          rewardsHistory: [],
          lastUpdated: Date.now()
        });
      }

      // Get earliest stake timestamp
      const earliestStake = userStakes[0]?.createdAt || new Date();

      // Calculate current rewards based on total staked amount and earliest stake time
      const currentRewards = calculateRewardsForTimestamp(totalStaked, earliestStake.getTime(), Date.now());

      // Calculate monthly rewards based on 3% APY
      const monthlyRewards = (totalStaked * 0.03) / 12; // Monthly rewards based on 3% APY

      // Generate response data with 9 decimal precision
      const stakingData = {
        totalStaked,
        rewards: parseFloat(currentRewards.toFixed(9)),
        monthlyRewards: parseFloat(monthlyRewards.toFixed(9)),
        rewardsHistory: generateRewardsHistory(totalStaked, earliestStake.getTime()),
        lastUpdated: Date.now()
      };

      res.json(stakingData);
    } catch (error) {
      console.error('Error fetching staking data:', error);
      res.status(500).json({ error: 'Failed to fetch staking data' });
    }
  });

  // Get network statistics for a specific coin
  app.get('/api/network-stats/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toLowerCase();

    if (!NETWORK_STATS[symbol as keyof typeof NETWORK_STATS]) {
      return res.status(404).json({ error: 'Coin not found' });
    }

    const stats = NETWORK_STATS[symbol as keyof typeof NETWORK_STATS];

    // For ETH, we'll also include actual platform statistics
    if (symbol === 'eth') {
      try {
        // Get platform statistics from our database
        const platformStats = await db.select({
          totalStakers: count(stakes.userId),
          avgStake: avg(stakes.amount),
        })
          .from(stakes)
          .where(eq(stakes.status, 'active'));

        // Get total value locked
        const tvlResult = await db.select({
          sum: sql<string>`sum(amount)::numeric`
        })
          .from(stakes)
          .where(eq(stakes.status, 'active'));

        const platformTvl = parseFloat(tvlResult[0]?.sum || '0');

        // Combine real platform data with network data
        stats.current.rewards = platformStats[0]?.totalStakers || 0; // updated to use rewards instead of totalStakers
        stats.current.avgStake = parseFloat(platformStats[0]?.avgStake?.toString() || '0');
        stats.current.tvl = platformTvl + stats.current.tvl;

        // Update historical data with platform data
        stats.history = stats.history.map(point => ({
          ...point,
          tvl: point.tvl + platformTvl,
        }));
      } catch (error) {
        console.error('Error fetching platform statistics:', error);
      }
    }

    res.json({
      current: stats.current,
      history: stats.history,
      lastUpdated: new Date().toISOString()
    });
  });

  // Initiate staking
  app.post('/api/stakes', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const validationResult = stakeRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid request data',
          details: validationResult.error.issues
        });
      }

      const { amount } = validationResult.data;

      // Create stake in database
      const [newStake] = await db.insert(stakes)
        .values({
          userId: req.user.id,
          amount: amount,
          status: 'active',
        })
        .returning();

      // Record the transaction
      await db.insert(transactions)
        .values({
          userId: req.user.id,
          type: 'stake',
          amount: amount,
          status: 'completed',
        });

      res.json(newStake);
    } catch (error) {
      console.error('Staking error:', error);
      res.status(500).json({ error: 'Failed to create stake' });
    }
  });

  // Get user stakes
  app.get('/api/users/:userId/stakes', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stakes = store.getStakesByUser(userId);
      res.json(stakes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user stakes' });
    }
  });

  // Get stake rewards
  app.get('/api/stakes/:stakeId/rewards', async (req, res) => {
    try {
      const stakeId = parseInt(req.params.stakeId);
      const rewards = store.getRewardsByStake(stakeId);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stake rewards' });
    }
  });

  // Create reward for stake
  app.post('/api/stakes/:stakeId/rewards', async (req, res) => {
    try {
      const stakeId = parseInt(req.params.stakeId);
      const { amount } = req.body;
      const reward = store.createReward({
        stakeId,
        amount: amount.toString(),
        createdAt: new Date()
      });
      res.json(reward);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create reward' });
    }
  });

  // Record transaction
  app.post('/api/transactions', async (req, res) => {
    try {
      const { userId, type, amount } = req.body;
      const transaction = store.createTransaction({
        userId,
        type,
        amount: amount.toString(),
        status: 'pending',
        createdAt: new Date()
      });
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}