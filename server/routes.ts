import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { z } from "zod";
import { setupAuth } from "./auth";
import { stakes, rewards, transactions } from "@db/schema";
import { eq, and } from "drizzle-orm";

// Validation schema for stake request
const stakeRequestSchema = z.object({
  amount: z.string().refine((val) => {
    const amount = parseFloat(val);
    return !isNaN(amount) && amount >= 0.01; // Minimum 0.01 ETH
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
      rewards: parseFloat(rewards.toFixed(9))
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

      // Get user's total staked amount
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
      const monthlyRewards = (totalStaked * 0.03) / 12;

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

      // Create active stake in database (simulated)
      const [newStake] = await db.insert(stakes)
        .values({
          userId: req.user.id,
          amount: amount,
          status: 'active', // Directly set as active for simulation
        })
        .returning();

      // Record the transaction
      await db.insert(transactions)
        .values({
          userId: req.user.id,
          type: 'stake',
          amount: amount,
          status: 'completed', // Directly set as completed for simulation
        });

      res.json(newStake);
    } catch (error) {
      console.error('Staking error:', error);
      res.status(500).json({ error: 'Failed to create stake' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}