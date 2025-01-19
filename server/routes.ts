import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { z } from "zod";
import { store } from "./store";
import { setupAuth } from "./auth";
import { stakes, rewards, transactions } from "@db/schema";
import { eq } from "drizzle-orm";

// Validation schema for stake request
const stakeRequestSchema = z.object({
  amount: z.string().refine((val) => {
    const amount = parseFloat(val);
    return !isNaN(amount) && amount >= 0.01; // Minimum 0.01 ETH
  }, {
    message: "Minimum stake amount is 0.01 ETH"
  })
});

// Calculate rewards based on 3% APY
function calculateRewards(stakedAmount: number, startTimeMs: number): number {
  const now = Date.now();
  const timePassedMs = now - startTimeMs;
  const yearsElapsed = timePassedMs / (365 * 24 * 60 * 60 * 1000);
  return stakedAmount * 0.03 * yearsElapsed; // 3% APY
}

// Generate rewards history based on time range
function generateRewardsHistory(totalStaked: number, startTime: number): Array<{ timestamp: number; rewards: number }> {
  const history = [];
  const now = Date.now();
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
  const intervalMinutes = 5; // Data points every 5 minutes

  // Generate data points for the last week
  for (let timestamp = oneWeekAgo; timestamp <= now; timestamp += intervalMinutes * 60 * 1000) {
    const rewards = calculateRewards(totalStaked, startTime);
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
          monthlyRewards: 0, // Renamed from projected
          rewardsHistory: [],
          lastUpdated: Date.now()
        });
      }

      // Get earliest stake timestamp
      const earliestStake = userStakes[0]?.createdAt || new Date();

      // Calculate current rewards based on total staked amount and earliest stake time
      const currentRewards = calculateRewards(totalStaked, earliestStake.getTime());

      // Calculate monthly rewards based on 3% APY
      const monthlyRewards = (totalStaked * 0.03) / 12; // Monthly rewards based on 3% APY

      // Generate response data with 9 decimal precision
      const stakingData = {
        totalStaked,
        rewards: parseFloat(currentRewards.toFixed(9)),
        monthlyRewards: parseFloat(monthlyRewards.toFixed(9)), // Renamed from projected
        rewardsHistory: generateRewardsHistory(totalStaked, earliestStake.getTime()),
        lastUpdated: Date.now()
      };

      console.log('Returning staking data:', {
        userId: req.user.id,
        totalStaked,
        rewards: stakingData.rewards,
        monthlyRewards: stakingData.monthlyRewards,
        lastUpdated: new Date().toISOString()
      });

      res.json(stakingData);
    } catch (error) {
      console.error('Error fetching staking data:', error);
      res.status(500).json({ error: 'Failed to fetch staking data' });
    }
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

      console.log('New stake created:', {
        userId: req.user.id,
        amount,
        stakeId: newStake.id,
        timestamp: new Date().toISOString()
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