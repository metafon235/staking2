import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { z } from "zod";
import { store } from "./store";
import { coinbaseService } from "./services/coinbase";

export function registerRoutes(app: Express): Server {
  // Get staking overview data
  app.get('/api/staking/data', async (req, res) => {
    try {
      const mockData = {
        totalStaked: 32.5,
        rewards: 0.85,
        projected: 1.2,
        rewardsHistory: [
          { timestamp: Date.now() - 86400000 * 30, rewards: 0.2 },
          { timestamp: Date.now() - 86400000 * 20, rewards: 0.4 },
          { timestamp: Date.now() - 86400000 * 10, rewards: 0.6 },
          { timestamp: Date.now(), rewards: 0.85 }
        ]
      };

      res.json(mockData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch staking data' });
    }
  });

  // Initiate staking
  app.post('/api/stakes', async (req, res) => {
    try {
      const { userId, amount } = req.body;

      // Validate input
      if (!userId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get user's ETH balance
      const balance = await coinbaseService.getEthereumBalance();
      if (parseFloat(balance) < parseFloat(amount)) {
        return res.status(400).json({ error: 'Insufficient ETH balance' });
      }

      // Initiate staking with Coinbase
      const stakingResponse = await coinbaseService.initiateStaking(amount);

      // Record the stake in our database
      const stake = store.createStake({
        userId,
        amount: amount.toString(),
        status: stakingResponse.status,
        transactionHash: stakingResponse.transactionId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Record the transaction
      store.createTransaction({
        userId,
        type: 'stake',
        amount: amount.toString(),
        status: 'pending',
        transactionHash: stakingResponse.transactionId,
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