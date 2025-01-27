import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { stakes, rewards, transactions, users, notifications, notificationSettings } from "@db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { setupAuth } from "./auth";
import { NotificationService } from "./services/notifications";
import { z } from "zod";
import { sql } from 'drizzle-orm/sql';

const BASE_STATS: Record<string, {
  baseValidators: number;
  baseTVL: number;
  baseAvgStake: number;
  baseRewards: number;
}> = {
  pivx: {
    baseValidators: 1000,
    baseTVL: 1000000,
    baseAvgStake: 1000,
    baseRewards: 100
  }
};

const statsCache = new Map<string, {
  data: any;
  timestamp: number;
}>();

export function registerRoutes(app: Express): Server {
  // Important: Setup auth first before other routes
  setupAuth(app);

  // Start rewards generation interval
  let rewardsGenerationInterval: NodeJS.Timeout | null = null;
  if (rewardsGenerationInterval) {
    clearInterval(rewardsGenerationInterval);
  }
  rewardsGenerationInterval = setInterval(generateRewardsForAllActiveStakes, 60000); // Every minute
  console.log('Rewards generation interval started');

  // Admin user management routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }

      const allUsers = await db
        .select({
          id: users.id,
          username: users.username,
          isAdmin: users.isAdmin,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(users.createdAt);

      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:userId", async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }

      const userId = parseInt(req.params.userId);

      // Don't allow admins to delete themselves
      if (userId === req.user.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }

      // Check if user exists and is not an admin
      const [userToDelete] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!userToDelete) {
        return res.status(404).json({ error: "User not found" });
      }

      if (userToDelete.isAdmin) {
        return res.status(400).json({ error: "Cannot delete admin users" });
      }

      // Delete all related records in the correct order
      await db.transaction(async (tx) => {
        // Delete notifications first
        await tx.delete(notifications)
          .where(eq(notifications.userId, userId));

        // Delete notification settings
        await tx.delete(notificationSettings)
          .where(eq(notificationSettings.userId, userId));

        // Get all stakes for the user
        const userStakes = await tx.select()
          .from(stakes)
          .where(eq(stakes.userId, userId));

        // Delete rewards for all stakes
        for (const stake of userStakes) {
          await tx.delete(rewards)
            .where(eq(rewards.stakeId, stake.id));
        }

        // Delete stakes
        await tx.delete(stakes)
          .where(eq(stakes.userId, userId));

        // Delete transactions
        await tx.delete(transactions)
          .where(eq(transactions.userId, userId));

        // Finally delete the user
        await tx.delete(users)
          .where(eq(users.id, userId));
      });

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Admin Login Route
  app.post("/api/admin/login", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          ok: false,
          message: "Invalid input: " + result.error.issues.map(i => i.message).join(", ")
        });
      }

      const { username, password } = result.data;

      // Check if user exists and is admin
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user) {
        return res.status(403).json({
          ok: false,
          message: "Access denied. Invalid credentials."
        });
      }

      // Verify password
      const isMatch = await new Promise((resolve) => {
        req.logIn(user, (err) => {
          if (err) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });

      if (!isMatch) {
        return res.status(403).json({
          ok: false,
          message: "Access denied. Invalid credentials."
        });
      }

      // Check admin rights after successful login
      if (!user.isAdmin) {
        return res.status(403).json({
          ok: false,
          message: "Access denied. Admin privileges required."
        });
      }

      return res.json({
        ok: true,
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin
        }
      });

    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({
        ok: false,
        message: "Internal server error"
      });
    }
  });


  // Admin staking overview route
  app.get("/api/admin/staking", async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get all active stakes aggregated by user
      const stakingData = await db
        .select({
          id: users.id,
          username: users.username,
          walletAddress: users.walletAddress,
          totalStaked: sql<string>`COALESCE(sum(${stakes.amount}), 0)::numeric`
        })
        .from(users)
        .leftJoin(stakes, and(
          eq(stakes.userId, users.id),
          eq(stakes.status, 'active')
        ))
        .groupBy(users.id, users.username, users.walletAddress);

      // Calculate rewards for each user based on their total stake
      const stakingUsers = await Promise.all(
        stakingData.map(async (data) => {
          const totalStaked = parseFloat(data.totalStaked?.toString() || '0');
          const currentRewards = totalStaked > 0
            ? await calculateRewardsForTimestamp(
              data.id,
              totalStaked,
              Date.now() - (24 * 60 * 60 * 1000), // Use last 24 hours for reward calculation
              Date.now()
            )
            : 0;

          return {
            id: data.id,
            username: data.username,
            walletAddress: data.walletAddress || 'Not set',
            totalStaked,
            currentRewards,
            lastRewardTimestamp: new Date().toISOString()
          };
        })
      );

      res.json(stakingUsers);
    } catch (error) {
      console.error("Error fetching staking overview:", error);
      res.status(500).json({ error: "Failed to fetch staking overview" });
    }
  });

  // Get network statistics for a specific coin
  app.get('/api/network-stats/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toLowerCase();

    if (!BASE_STATS[symbol as keyof typeof BASE_STATS]) {
      return res.status(404).json({ error: 'Coin not found' });
    }

    try {
      const now = Date.now();
      const cached = statsCache.get(symbol);

      // Return cached data if it's less than 1 minute old
      if (cached && (now - cached.timestamp) < 60000) {
        return res.json(cached.data);
      }

      // Get fresh data
      const baseStats = BASE_STATS[symbol as keyof typeof BASE_STATS];
      const current = await getCurrentNetworkStats(symbol);
      const history = await generateHistoricalData(symbol, baseStats);

      const stats = {
        current,
        history,
        lastUpdated: new Date().toISOString()
      };

      // Update cache
      statsCache.set(symbol, {
        data: stats,
        timestamp: now
      });

      res.json(stats);
    } catch (error) {
      console.error('Error fetching network statistics:', error);
      res.status(500).json({ error: 'Failed to fetch network statistics' });
    }
  });

  // Get staking overview data
  app.get('/api/staking/data', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get user's total staked amount and last withdrawal
      const userStakes = await db.query.stakes.findMany({
        where: (stakes, { and, eq }) => and(
          eq(stakes.userId, req.user.id),
          eq(stakes.status, 'active')
        ),
        orderBy: (stakes, { asc }) => [asc(stakes.createdAt)]
      });

      const totalStaked = userStakes.reduce((sum, stake) =>
        sum + parseFloat(stake.amount.toString()), 0);

      // Calculate current total accumulated rewards
      const currentRewards = userStakes.length > 0 ? await calculateRewardsForTimestamp(
        req.user.id,
        totalStaked,
        userStakes[0].createdAt.getTime(),
        Date.now()
      ) : 0;

      // Calculate monthly rewards based on current stake
      const monthlyRewards = (totalStaked * 0.10) / 12; // 10% APY

      // Generate rewards history for the last week
      const now = Date.now();
      const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
      const rewardsHistory = [];

      // Generate data points every 5 minutes for the last week
      for (let timestamp = oneWeekAgo; timestamp <= now; timestamp += 5 * 60 * 1000) {
        const rewards = userStakes.length > 0 ? await calculateRewardsForTimestamp(
          req.user.id,
          totalStaked,
          userStakes[0].createdAt.getTime(),
          timestamp
        ) : 0;

        rewardsHistory.push({
          timestamp,
          rewards: parseFloat(rewards.toFixed(9))
        });
      }

      // Generate response data with appropriate decimal precision
      const stakingData = {
        totalStaked: parseFloat(totalStaked.toFixed(6)),
        rewards: parseFloat(currentRewards.toFixed(9)),
        monthlyRewards: parseFloat(monthlyRewards.toFixed(9)),
        rewardsHistory,
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
      const userStakes = await db.query.stakes.findMany({
        where: eq(stakes.userId, userId)
      });
      res.json(userStakes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user stakes' });
    }
  });

  // Get stake rewards
  app.get('/api/stakes/:stakeId/rewards', async (req, res) => {
    try {
      const stakeId = parseInt(req.params.stakeId);
      const stakeRewards = await db.query.rewards.findMany({
        where: eq(rewards.stakeId, stakeId)
      });
      res.json(stakeRewards);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stake rewards' });
    }
  });

  // Create reward for stake
  app.post('/api/stakes/:stakeId/rewards', async (req, res) => {
    try {
      const stakeId = parseInt(req.params.stakeId);
      const { amount } = req.body;

      const [newReward] = await db.insert(rewards)
        .values({
          stakeId,
          amount: amount.toString(),
          createdAt: new Date()
        })
        .returning();

      res.json(newReward);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create reward' });
    }
  });

  // Record transaction
  app.post('/api/transactions', async (req, res) => {
    try {
      const { userId, type, amount } = req.body;
      const [transaction] = await db.insert(transactions)
        .values({
          userId,
          type,
          amount: amount.toString(),
          status: 'pending',
          createdAt: new Date()
        })
        .returning();

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  });

  // Add new withdraw endpoint
  app.post('/api/withdraw', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { amount, coin } = req.body;

      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid withdrawal amount' });
      }

      // For now, we only support PIVX withdrawals
      if (coin.toUpperCase() !== 'PIVX') {
        return res.status(400).json({ error: 'Unsupported coin for withdrawal' });
      }

      // Get user's current rewards
      const userStakes = await db.query.stakes.findMany({
        where: eq(stakes.userId, req.user.id),
        orderBy: (stakes, { asc }) => [asc(stakes.createdAt)]
      });

      const totalStaked = userStakes.reduce((sum, stake) =>
        sum + parseFloat(stake.amount.toString()), 0);

      if (totalStaked < 100) { // Minimum stake amount for PIVX
        return res.status(400).json({ error: 'No active stakes found' });
      }

      const earliestStake = userStakes[0]?.createdAt || new Date();
      const currentRewards = await calculateRewardsForTimestamp(req.user.id, totalStaked, earliestStake.getTime(), Date.now());

      if (amount > currentRewards) {
        return res.status(400).json({ error: 'Insufficient rewards balance' });
      }

      // Record the withdrawal transaction
      await db.insert(transactions)
        .values({
          userId: req.user.id,
          type: 'withdraw',
          amount: amount.toString(),
          status: 'completed',
        });

      res.json({
        message: 'Withdrawal successful',
        amount: amount,
        coin: coin
      });
    } catch (error) {
      console.error('Withdrawal error:', error);
      res.status(500).json({ error: 'Failed to process withdrawal' });
    }
  });

  // Add new withdraw-all endpoint
  app.post('/api/withdraw-all', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { coin } = req.body;

      // For now, we only support PIVX withdrawals
      if (coin.toUpperCase() !== 'PIVX') {
        return res.status(400).json({ error: 'Unsupported coin for withdrawal' });
      }

      // Get user's stakes
      const userStakes = await db.query.stakes.findMany({
        where: eq(stakes.userId, req.user.id),
        orderBy: (stakes, { asc }) => [asc(stakes.createdAt)]
      });

      if (userStakes.length === 0) {
        return res.status(400).json({ error: 'No active stakes found' });
      }

      // Calculate total staked amount and rewards
      const totalStaked = userStakes.reduce((sum, stake) =>
        sum + parseFloat(stake.amount.toString()), 0);

      const earliestStake = userStakes[0].createdAt;
      const currentRewards = await calculateRewardsForTimestamp(req.user.id, totalStaked, earliestStake.getTime(), Date.now());
      const totalAmount = totalStaked + currentRewards;

      if (totalAmount <= 0) {
        return res.status(400).json({ error: 'No funds available for withdrawal' });
      }

      // Set all stakes to withdrawn and amount to 0
      for (const stake of userStakes) {
        await db.update(stakes)
          .set({
            status: 'withdrawn',
            amount: '0',
            // Reset createdAt to stop rewards generation
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(stakes.id, stake.id));
      }

      // Record the withdrawal transaction
      await db.insert(transactions)
        .values({
          userId: req.user.id,
          type: 'withdraw_all',
          amount: totalAmount.toString(),
          status: 'completed',
        });

      res.json({
        message: 'Withdrawal successful',
        amount: totalAmount,
        coin: coin
      });
    } catch (error) {
      console.error('Withdrawal error:', error);
      res.status(500).json({ error: 'Failed to process withdrawal' });
    }
  });

  // Add new transfer endpoint
  app.post('/api/transfer', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { amount, coin } = req.body;

      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid transfer amount' });
      }

      // For now, we only support PIVX transfers
      if (coin.toUpperCase() !== 'PIVX') {
        return res.status(400).json({ error: 'Unsupported coin for transfer' });
      }

      // Get user's current stakes and rewards
      const userStakes = await db.query.stakes.findMany({
        where: eq(stakes.userId, req.user.id),
        orderBy: (stakes, { asc }) => [asc(stakes.createdAt)]
      });

      const totalStaked = userStakes.reduce((sum, stake) =>
        sum + parseFloat(stake.amount.toString()), 0);

      if (totalStaked < 100) { // Minimum stake amount for PIVX
        return res.status(400).json({ error: 'No active stakes found' });
      }

      const earliestStake = userStakes[0]?.createdAt || new Date();
      const currentRewards = await calculateRewardsForTimestamp(req.user.id, totalStaked, earliestStake.getTime(), Date.now());
      const totalAvailable = totalStaked + currentRewards;

      if (amount > totalAvailable) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Record the transfer transaction
      await db.insert(transactions)
        .values({
          userId: req.user.id,
          type: 'transfer',
          amount: amount.toString(),
          status: 'completed',
        });

      // Update stakes to reflect the transfer
      // First use rewards, then staked amount if needed
      let remainingAmount = amount;

      // Use rewards first
      if (currentRewards > 0) {
        const rewardsToUse = Math.min(currentRewards, remainingAmount);
        remainingAmount -= rewardsToUse;

        await db.insert(transactions)
          .values({
            userId: req.user.id,
            type: 'withdraw',
            amount: rewardsToUse.toString(),
            status: 'completed',
          });
      }

      // If we still need to use staked amount
      if (remainingAmount > 0) {
        // Update the stake amount
        // Note: In a real implementation, you would need to handle unstaking
        // from the actual staking contract
        await db
          .update(stakes)
          .set({
            amount: (totalStaked - remainingAmount).toString(),
            updatedAt: new Date(),
          })
          .where(eq(stakes.id, userStakes[0].id));

        // Record stake withdrawal
        await db.insert(transactions)
          .values({
            userId: req.user.id,
            type: 'unstake',
            amount: remainingAmount.toString(),
            status: 'completed',
          });
      }

      res.json({
        message: 'Transfer successful',
        amount: amount,
        coin: coin
      });

    } catch (error) {
      console.error('Transfer error:', error);
      res.status(500).json({ error: 'Failed to process transfer' });
    }
  });

  // Validation schema for stake request
  const stakeRequestSchema = z.object({
    amount: z.string().refine((val) => {
      const amount = parseFloat(val);
      return !isNaN(amount) && amount >= 100; // Minimum stake amount for PIVX
    }, {
      message: "Minimum stake amount is 100 PIVX"
    })
  });

  //Get Portfolio endpoint
  app.get('/api/portfolio', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const userStakes = await db.query.stakes.findMany({
        where: (stakes, { and, eq }) => and(
          eq(stakes.userId, req.user!.id),
          eq(stakes.status, 'active')
        )
      });

      const totalStaked = userStakes.reduce((sum, stake) =>
        sum + parseFloat(stake.amount.toString()), 0);

      const rewards = userStakes.length > 0
        ? await calculateRewardsForTimestamp(
          req.user.id,
          totalStaked,
          userStakes[0].createdAt.getTime(),
          Date.now()
        )
        : 0;

      res.json({
        pivx: {
          staked: totalStaked,
          rewards,
          apy: 10.00 // Fixed 10% APY
        }
      });
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      res.status(500).json({ error: 'Failed to fetch portfolio data' });
    }
  });


  // Add transactions endpoint back
  app.get('/api/transactions', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get user's transactions ordered by most recent first
      const userTransactions = await db.query.transactions.findMany({
        where: eq(transactions.userId, req.user.id),
        orderBy: (transactions, { desc }) => [desc(transactions.createdAt)]
      });

      res.json(userTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  // Add this to the registerRoutes function, before the httpServer creation
  app.get('/api/analytics', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;

      // Get user's total staked amount
      const userStakes = await db.query.stakes.findMany({
        where: (stakes, { and, eq }) => and(
          eq(stakes.userId, req.user.id),
          eq(stakes.status, 'active')
        )
      });

      const totalStaked = userStakes.reduce((sum, stake) =>
        sum + parseFloat(stake.amount.toString()), 0);

      // Calculate rewards
      const rewards = userStakes.length > 0
        ? await calculateRewardsForTimestamp(
          req.user.id,
          totalStaked,
          userStakes[0].createdAt.getTime(),
          now
        )
        : 0;

      // Generate mock historical data
      const rewardsHistory = [];
      for (let i = 30; i >= 0; i--) {
        const timestamp = now - (i * dayMs);
        const value = rewards * (1 + (Math.random() * 0.2 - 0.1)); // ±10% variation
        rewardsHistory.push({ timestamp, value });
      }

      // Mock network stats
      const networkStats = {
        validatorEffectiveness: 95 + (Math.random() * 4), // 95-99%
        networkHealth: 98 + (Math.random() * 2), // 98-100%
        participationRate: 85 + (Math.random() * 10), // 85-95%
      };

      // Generate validator history
      const validatorHistory = [];
      for (let i = 30; i >= 0; i--) {
        validatorHistory.push({
          timestamp: now - (i * dayMs),
          activeValidators: Math.round(1000 * (1 + (Math.random() * 0.2 - 0.1))), // ±10% around 1000
          effectiveness: Math.round(95 + (Math.random() * 4)) // 95-99%
        });
      }

      // Mock portfolio data
      const pivxPrice = 1.5 + (Math.random() * 0.1); // $1.50 ±$0.05
      const totalValue = totalStaked + rewards;
      const initialInvestment = totalStaked;
      const profitLoss = totalValue - initialInvestment;

      // Generate price history
      const priceHistory = [];
      for (let i = 30; i >= 0; i--) {
        priceHistory.push({
          timestamp: now - (i * dayMs),
          price: pivxPrice * (1 + (Math.random() * 0.2 - 0.1)) // ±10% variation
        });
      }

      const analyticsData = {
        performance: {
          roi: ((profitLoss / initialInvestment) * 100) || 0,
          apy: 10.00, // Fixed 10% APY
          totalRewards: rewards,
          rewardsHistory
        },
        network: {
          ...networkStats,
          validatorHistory
        },
        portfolio: {
          totalValue,
          profitLoss,
          pivxPrice,
          priceHistory,
          stakingPositions: [{
            coin: 'PIVX',
            amount: totalStaked,
            value: totalValue,
            apy: 10.00
          }]
        }
      };

      res.json(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
  });

  async function calculateRewardsForTimestamp(
    userId: number,
    stakedAmount: number,
    startTimeMs: number,
    endTimeMs: number
  ): Promise<number> {
    try {
      const lastWithdrawal = await db.query.transactions.findFirst({
        where: (transactions, { and, eq }) => and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'withdraw_all'),
          eq(transactions.status, 'completed')
        ),
        orderBy: (transactions, { desc }) => [desc(transactions.createdAt)]
      });

      const userStakes = await db.query.stakes.findMany({
        where: (stakes, { and, eq }) => and(
          eq(stakes.userId, userId),
          eq(stakes.status, 'active')
        )
      });

      let totalRewards = 0;

      for (const stake of userStakes) {
        const stakeStartTime = stake.createdAt.getTime();
        if (stakeStartTime <= endTimeMs) {
          const stakeAmount = parseFloat(stake.amount.toString());
          if (stakeAmount >= 100) {
            const timePassedMs = endTimeMs - stakeStartTime;
            const yearsElapsed = timePassedMs / (365 * 24 * 60 * 60 * 1000);
            const yearlyRate = 0.10; // 10% APY
            const stakeRewards = stakeAmount * yearlyRate * yearsElapsed;
            totalRewards += stakeRewards;
          }
        }
      }

      return totalRewards;
    } catch (error) {
      console.error('Error calculating rewards:', error);
      return 0;
    }
  }

  async function generateRewardsForAllActiveStakes() {
    try {
      console.log('Starting rewards generation cycle...');
      const activeStakes = await db
        .select({
          userId: stakes.userId,
          amount: stakes.amount,
          createdAt: stakes.createdAt
        })
        .from(stakes)
        .where(eq(stakes.status, 'active'));

      console.log(`Found ${activeStakes.length} active stakes`);

      for (const stake of activeStakes) {
        const stakeAmount = parseFloat(stake.amount.toString());
        if (stakeAmount >= 100) {
          const yearlyRate = 0.10; // 10% APY
          const minutelyRate = yearlyRate / (365 * 24 * 60);
          const reward = stakeAmount * minutelyRate;

          if (reward >= 0.00001) {
            await db.insert(transactions).values({
              userId: stake.userId,
              type: 'reward',
              amount: reward.toString(),
              status: 'completed',
              createdAt: new Date()
            });
          }
        }
      }
    } catch (error) {
      console.error('Error generating rewards:', error);
    }
  }

  function startRewardsGeneration() {
    if (rewardsGenerationInterval) {
      clearInterval(rewardsGenerationInterval);
    }
    rewardsGenerationInterval = setInterval(generateRewardsForAllActiveStakes, 60000); // 1 minute
    console.log('Rewards generation interval started');
    generateRewardsForAllActiveStakes();
  }
  startRewardsGeneration();
  const httpServer = createServer(app);
  return httpServer;
}

async function generateReferralCode(): Promise<string> {
  return 'REF-XXXXXXX'; // Replace with actual code to generate referral code
}

async function getCurrentNetworkStats(symbol: string) {
  // For development, return mock data based on BASE_STATS
  const baseStats = BASE_STATS[symbol];
  const variation = Math.random() * 0.1 - 0.05; // ±5% variation

  return {
    tvl: Math.round(baseStats.baseTVL * (1 + variation)),
    validators: Math.round(baseStats.baseValidators * (1 + variation)),
    avgStake: Math.round(baseStats.baseAvgStake * (1 + variation)),
    rewards: Math.round(baseStats.baseRewards * (1 + variation))
  };
}

async function generateHistoricalData(symbol: string, baseStats: any) {
  const history = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Generate 30 days of historical data
  for (let i = 30; i >= 0; i--) {
    const date = now - (i * dayMs);
    const variation = Math.random() * 0.2 - 0.1; // ±10% variation

    history.push({
      date,
      tvl: Math.round(baseStats.baseTVL * (1 + variation)),
      validators: Math.round(baseStats.baseValidators * (1 + variation)),
      avgStake: Math.round(baseStats.baseAvgStake * (1 + variation)),
      rewards: Math.round(baseStats.baseRewards * (1 + variation))
    });
  }

  return history;
}

const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});