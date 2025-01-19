import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { z } from "zod";
import { store } from "./store";

// Validation schema for stake request
const stakeRequestSchema = z.object({
  userId: z.number(),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number"
  })
});

// Calculate rewards based on 3% APY
function calculateRewards(stakedAmount: number, timestampMs: number): number {
  const APY = 0.03; // 3% annual yield
  const now = Date.now();
  const timePassedMs = now - timestampMs;
  const yearsElapsed = timePassedMs / (365 * 24 * 60 * 60 * 1000);
  return Math.round((stakedAmount * APY * yearsElapsed) * 1000000) / 1000000;
}

// Generate minute-by-minute rewards history
function generateRewardsHistory(totalStaked: number): Array<{ timestamp: number; rewards: number }> {
  const history = [];
  const now = Date.now();
  const startTime = now - (60 * 60 * 1000); // Start from 1 hour ago

  // Generate data points for the last 60 minutes
  for (let i = 0; i < 60; i++) {
    const timestamp = startTime + (i * 60 * 1000); // Every minute
    const rewards = calculateRewards(totalStaked, startTime);
    history.push({
      timestamp,
      rewards: Math.round(rewards * (i + 1) / 60 * 1000000) / 1000000 // Linear interpolation
    });
  }
  return history;
}

export function registerRoutes(app: Express): Server {
  // Get staking overview data
  app.get('/api/staking/data', async (req, res) => {
    try {
      const totalStaked = 100; // Mock 100 ETH staked
      const startTime = Date.now() - (60 * 60 * 1000); // Started staking 1 hour ago

      // Calculate current rewards based on time elapsed
      const currentRewards = calculateRewards(totalStaked, startTime);

      // Project rewards for the next month (30 days)
      const projectedRewards = (totalStaked * 0.03) / 12; // Monthly projection based on APY

      const mockData = {
        totalStaked,
        rewards: currentRewards,
        projected: Math.round(projectedRewards * 1000000) / 1000000,
        rewardsHistory: generateRewardsHistory(totalStaked),
        lastUpdated: Date.now()
      };

      console.log('Returning staking data:', { 
        totalStaked,
        rewards: currentRewards,
        projected: projectedRewards,
        lastUpdated: new Date().toISOString()
      });

      res.json(mockData);
    } catch (error) {
      console.error('Error fetching staking data:', error);
      res.status(500).json({ error: 'Failed to fetch staking data' });
    }
  });

  // Initiate staking
  app.post('/api/stakes', async (req, res) => {
    try {
      // Validate request body
      const validationResult = stakeRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.error('Validation error:', validationResult.error);
        return res.status(400).json({ 
          error: 'Invalid request data',
          details: validationResult.error.issues
        });
      }

      const { userId, amount } = validationResult.data;

      // Create mock stake
      const stake = store.createStake({
        userId,
        amount: amount.toString(),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Record the transaction
      store.createTransaction({
        userId,
        type: 'stake',
        amount: amount.toString(),
        status: 'completed',
        createdAt: new Date()
      });

      res.json(stake);
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