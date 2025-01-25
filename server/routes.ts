import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import adminRouter from "./routes/admin";
import { db } from "@db";
import { z } from "zod";
import { stakes, rewards, transactions, users, notifications } from "@db/schema";
import { eq, count, avg, sql, sum, and, gt, desc } from "drizzle-orm";
import { NotificationService } from "./services/notifications";
import * as crypto from 'crypto';

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

// Calculate real-time network rewards based on staking data
async function calculateNetworkRewards(symbol: string): Promise<number> {
  if (symbol.toLowerCase() !== 'eth') {
    return BASE_STATS[symbol as keyof typeof BASE_STATS].rewards;
  }

  try {
    // Get all active stakes
    const result = await db.select({
      totalStaked: sql<string>`sum(amount)::numeric`,
      avgStakeTime: sql<string>`avg(extract(epoch from (now() - created_at)))::numeric`
    })
      .from(stakes)
      .where(eq(stakes.status, 'active'));

    const totalStaked = parseFloat(result[0]?.totalStaked || '0');
    const avgStakeTimeSeconds = parseFloat(result[0]?.avgStakeTime || '0');

    // Calculate rewards based on 3% APY
    // Convert time to years for APY calculation
    const timeInYears = avgStakeTimeSeconds / (365 * 24 * 60 * 60);
    const networkRewards = totalStaked * 0.03 * timeInYears;

    return parseFloat(networkRewards.toFixed(8));
  } catch (error) {
    console.error('Error calculating network rewards:', error);
    return BASE_STATS.eth.rewards;
  }
}

// Generate sample historical data for a coin
async function generateHistoricalData(symbol: string, baseStats: typeof BASE_STATS[keyof typeof BASE_STATS]) {
  const now = Date.now();
  const data = [];
  const dailyRewardRate = baseStats.rewards / 30;

  // Generate data points for the last 30 days
  for (let i = 30; i >= 0; i--) {
    const date = now - (i * 24 * 60 * 60 * 1000);
    // Add some random variation to make the data look realistic
    const variation = () => 1 + (Math.random() * 0.1 - 0.05);

    const rewards = symbol.toLowerCase() === 'eth'
      ? await calculateNetworkRewards(symbol) * ((30 - i) / 30)
      : dailyRewardRate * (30 - i) * variation();

    data.push({
      date,
      tvl: baseStats.tvl * variation(),
      validators: Math.floor(baseStats.validators * variation()),
      avgStake: baseStats.avgStake * variation(),
      rewards: parseFloat(rewards.toFixed(8))
    });
  }

  return data;
}

// Get current network statistics
async function getCurrentNetworkStats(symbol: string) {
  const baseStats = BASE_STATS[symbol as keyof typeof BASE_STATS];
  const currentRewards = await calculateNetworkRewards(symbol);

  return {
    ...baseStats,
    rewards: currentRewards
  };
}

// Network statistics cache with 1-minute TTL
const statsCache = new Map<string, {
  data: any;
  timestamp: number;
}>();

// Active rewards generation interval
let rewardsGenerationInterval: NodeJS.Timeout | null = null;

// Add notification generation for rewards
const userRewardsCache = new Map<number, number>();
let lastNotificationTime = new Map<number, number>();

// Optimierte Rewards-Berechnung Funktion
async function generateRewardsForAllActiveStakes() {
  try {
    console.log('Starting optimized rewards generation cycle...');

    // Hole alle aktiven Stakes mit Benutzerinformationen in einem Query
    const activeStakes = await db
      .select({
        stakeId: stakes.id,
        userId: stakes.userId,
        amount: stakes.amount,
        createdAt: stakes.createdAt,
        username: users.username,
        lastNotification: notifications.createdAt
      })
      .from(stakes)
      .innerJoin(users, eq(users.id, stakes.userId))
      .leftJoin(
        notifications,
        and(
          eq(notifications.userId, stakes.userId),
          eq(notifications.type, 'reward')
        )
      )
      .where(eq(stakes.status, 'active'))
      .orderBy(desc(notifications.createdAt));

    console.log(`Found ${activeStakes.length} active stakes`);

    // Gruppiere Stakes nach Benutzer für Batch-Verarbeitung
    const userStakes = activeStakes.reduce((acc, stake) => {
      if (!acc[stake.userId]) {
        acc[stake.userId] = {
          stakes: [],
          lastNotification: stake.lastNotification,
          totalStaked: 0
        };
      }
      acc[stake.userId].stakes.push(stake);
      acc[stake.userId].totalStaked += parseFloat(stake.amount.toString());
      return acc;
    }, {} as Record<number, {
      stakes: typeof activeStakes,
      lastNotification: Date | null,
      totalStaked: number
    }>);

    const batchRewards = [];
    const batchNotifications = [];
    const now = new Date();

    for (const [userId, data] of Object.entries(userStakes)) {
      const { totalStaked, lastNotification } = data;

      if (totalStaked >= 0.01) {
        const yearlyRate = 0.03; // 3% APY
        const minutelyRate = yearlyRate / (365 * 24 * 60);
        const reward = totalStaked * minutelyRate;

        if (reward >= 0.00000001) {
          // Record per-minute rewards for accurate data
          batchRewards.push({
            userId: parseInt(userId),
            type: 'reward',
            amount: reward.toFixed(9),
            status: 'completed',
            createdAt: now
          });

          // Check if we should create an hourly notification
          const shouldNotify = !lastNotification ||
            (now.getTime() - lastNotification.getTime() >= 60 * 60 * 1000); // 60 minutes

          if (shouldNotify) {
            // Calculate hourly rewards (60 minutes worth)
            const hourlyRewards = reward * 60;
            batchNotifications.push({
              userId: parseInt(userId),
              type: 'reward',
              title: 'Hourly Staking Rewards Update',
              message: `You earned ${hourlyRewards.toFixed(9)} ETH from staking in the last hour`,
              data: JSON.stringify({ amount: hourlyRewards, timeframe: '1 hour' }),
              read: false,
              createdAt: now
            });
          }
        }
      }
    }

    // Batch-Insert for rewards
    if (batchRewards.length > 0) {
      await db.insert(transactions).values(batchRewards);
      console.log(`Processed ${batchRewards.length} rewards in batch`);
    }

    // Batch-Insert for notifications
    if (batchNotifications.length > 0) {
      await db.insert(notifications).values(batchNotifications);
      console.log(`Created ${batchNotifications.length} notifications in batch`);
    }

  } catch (error) {
    console.error('Error generating rewards:', error);
  }
}

// Optimierte Rewards-Berechnung für einen spezifischen Zeitstempel
async function calculateRewardsForTimestamp(
  userId: number,
  stakedAmount: number,
  startTimeMs: number,
  endTimeMs: number,
  forTransaction: boolean = false
): Promise<number> {
  try {
    // Cache-Key für diese Berechnung
    const cacheKey = `rewards:${userId}:${startTimeMs}:${endTimeMs}`;
    const cachedResult = await getFromCache(cacheKey);

    if (cachedResult !== null) {
      return parseFloat(cachedResult);
    }

    // Optimierte Query für letzte Withdrawal
    const lastWithdrawal = await db.query.transactions.findFirst({
      where: (transactions, { and, eq }) => and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'withdraw_all'),
        eq(transactions.status, 'completed')
      ),
      orderBy: (transactions, { desc }) => [desc(transactions.createdAt)]
    });

    // Optimierte Query für aktive Stakes
    const userStakes = await db.query.stakes.findMany({
      where: (stakes, { and, eq, gt }) => and(
        eq(stakes.userId, userId),
        eq(stakes.status, 'active'),
        lastWithdrawal ? gt(stakes.createdAt, lastWithdrawal.createdAt) : undefined
      ),
      orderBy: (stakes, { asc }) => [asc(stakes.createdAt)]
    });

    let totalRewards = 0;

    // Effizientere Rewards-Berechnung
    for (const stake of userStakes) {
      const stakeStartTime = stake.createdAt.getTime();
      if (stakeStartTime <= endTimeMs) {
        const stakeAmount = parseFloat(stake.amount.toString());
        if (stakeAmount >= 0.01) {
          const timePassedMs = endTimeMs - stakeStartTime;
          const yearsElapsed = timePassedMs / (365 * 24 * 60 * 60 * 1000);
          const yearlyRate = 0.03; // 3% APY
          const stakeRewards = stakeAmount * yearlyRate * yearsElapsed;
          totalRewards += stakeRewards;
        }
      }
    }

    // Cache das Ergebnis für 1 Minute
    await setInCache(cacheKey, totalRewards.toString(), 60);

    if (forTransaction && totalRewards > 0) {
      const minutelyReward = totalRewards / (365 * 24 * 60);
      if (minutelyReward >= 0.00000001) {
        await recordRewardTransaction(userId, minutelyReward);
      }
      return minutelyReward;
    }

    return totalRewards;
  } catch (error) {
    console.error('Error calculating rewards:', error);
    return 0;
  }
}

// Simple In-Memory Cache Implementation
const cache = new Map<string, { value: string; expires: number }>();

async function getFromCache(key: string): Promise<string | null> {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expires) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

async function setInCache(key: string, value: string, ttlSeconds: number): Promise<void> {
  cache.set(key, {
    value,
    expires: Date.now() + (ttlSeconds * 1000)
  });
}

async function recordRewardTransaction(userId: number, reward: number) {
  if (reward > 0) {
    try {
      // Check if we already have a reward transaction in the last minute
      const lastMinute = new Date(Date.now() - 60000); // 1 minute ago

      const recentReward = await db.query.transactions.findFirst({
        where: (transactions, { and, eq, gt }) => and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'reward'),
          gt(transactions.createdAt, lastMinute)
        ),
        orderBy: (transactions, { desc }) => [desc(transactions.createdAt)]
      });

      // Only create new reward transaction if none exists in the last minute
      if (!recentReward) {
        await db.insert(transactions)
          .values({
            userId,
            type: 'reward',
            amount: reward.toFixed(9), // Per-minute reward with 9 decimal precision
            status: 'completed',
            createdAt: new Date()
          });
      }
    } catch (error) {
      console.error('Error recording reward transaction:', error);
    }
  }
}

const insertUserSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(8)
});

export function registerRoutes(app: Express): Server {
  // Important: Setup auth first before other routes
  setupAuth(app);

  // Register admin routes
  app.use('/api/admin', adminRouter);

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
        Date.now(),
        false
      ) : 0;

      // Calculate monthly rewards based on current stake
      const monthlyRewards = (totalStaked * 0.03) / 12;

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
          timestamp,
          false
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

      // For now, we only support ETH withdrawals
      if (coin.toUpperCase() !== 'ETH') {
        return res.status(400).json({ error: 'Unsupported coin for withdrawal' });
      }

      // Get user's current rewards
      const userStakes = await db.query.stakes.findMany({
        where: eq(stakes.userId, req.user.id),
        orderBy: (stakes, { asc }) => [asc(stakes.createdAt)]
      });

      const totalStaked = userStakes.reduce((sum, stake) =>
        sum + parseFloat(stake.amount.toString()), 0);

      if (totalStaked < 0.01) {
        return res.status(400).json({ error: 'No active stakes found' });
      }

      const earliestStake = userStakes[0]?.createdAt || new Date();
      const currentRewards = await calculateRewardsForTimestamp(req.user.id, totalStaked, earliestStake.getTime(), Date.now(), false);

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

      // For now, we only support ETH withdrawals
      if (coin.toUpperCase() !== 'ETH') {
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
      const currentRewards = await calculateRewardsForTimestamp(req.user.id, totalStaked, earliestStake.getTime(), Date.now(), false);
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

      // For now, we only support ETH transfers
      if (coin.toUpperCase() !== 'ETH') {
        return res.status(400).json({ error: 'Unsupported coin for transfer' });
      }

      // Get user's current stakes and rewards
      const userStakes = await db.query.stakes.findMany({
        where: eq(stakes.userId, req.user.id),
        orderBy: (stakes, { asc }) => [asc(stakes.createdAt)]
      });

      const totalStaked = userStakes.reduce((sum, stake) =>
        sum + parseFloat(stake.amount.toString()), 0);

      if (totalStaked < 0.01) {
        return res.status(400).json({ error: 'No active stakes found' });
      }

      const earliestStake = userStakes[0]?.createdAt || new Date();
      const currentRewards = await calculateRewardsForTimestamp(req.user.id, totalStaked, earliestStake.getTime(), Date.now(), false);
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
      return !isNaN(amount) && amount >= 0.01;
    }, {
      message: "Minimum stake amount is 0.01 ETH"
    })
  });

  // Calculate rewards for a specific timestamp
  async function calculateRewardsForTimestamp(userId: number, stakedAmount: number, startTimeMs: number, endTimeMs: number, forTransaction: boolean = false): Promise<number> {
    try {
      // Get all active stakes for the user and their last complete withdrawal
      const lastWithdrawal = await db.query.transactions.findFirst({
        where: (transactions, { and, eq }) => and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'withdraw_all'),
          eq(transactions.status, 'completed')
        ),
        orderBy: (transactions, { desc }) => [desc(transactions.createdAt)]
      });

      // Get all active stakes created after the last withdrawal
      const userStakes = await db.query.stakes.findMany({
        where: (stakes, { and, eq, gt }) => and(
          eq(stakes.userId, userId),
          eq(stakes.status, 'active'),
          lastWithdrawal
            ? gt(stakes.createdAt, lastWithdrawal.createdAt)
            : undefined
        )
      });

      let totalRewards = 0;

      // Calculate rewards for each stake individually
      for (const stake of userStakes) {
        const stakeStartTime = stake.createdAt.getTime();
        // Only calculate rewards if the stake was created before the end time
        if (stakeStartTime <= endTimeMs) {
          const stakeAmount = parseFloat(stake.amount.toString());
          if (stakeAmount >= 0.01) { // Only calculate rewards for stakes >= 0.01 ETH
            const timePassedMs = endTimeMs - stakeStartTime;
            const yearsElapsed = timePassedMs / (365 * 24 * 60 * 60 * 1000);
            const yearlyRate = 0.03; // 3% APY
            const stakeRewards = stakeAmount * yearlyRate * yearsElapsed;
            totalRewards += stakeRewards;
          }
        }
      }

      // For transaction records, create minute-based snapshots
      if (forTransaction && totalRewards > 0) {
        const minutelyReward = totalRewards / (365 * 24 * 60);
        if (minutelyReward >= 0.00000001) { // Threshold at 8 decimals
          await recordRewardTransaction(userId, minutelyReward);
        }
        return minutelyReward;
      }

      return totalRewards;
    } catch (error) {
      console.error('Error calculating rewards:', error);
      return 0;
    }
  }

  // Get settings
  app.get('/api/settings', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get user's basic info
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user.id),
        columns: {
          walletAddress: true,
        }
      });

      res.json({
        walletAddress: user?.walletAddress || null
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  // Update wallet address
  app.post('/api/settings/wallet', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { walletAddress } = req.body;

      // Basic Ethereum address validation
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({ error: 'Invalid Ethereum address' });
      }

      await db.update(users)
        .set({ walletAddress })
        .where(eq(users.id, req.user.id));

      res.json({ message: 'Wallet address updated successfully' });
    } catch (error) {
      console.error('Error updating wallet address:', error);
      res.status(500).json({ error: 'Failed to update wallet address' });
    }
  });

  // Add new analytics endpoint
  app.get('/api/analytics', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(4001).json({ error: 'Not authenticated' });
      }

      // Get user's stakes and calculate total value
      const userStakes = await db.query.stakes.findMany({
        where: eq(stakes.userId, req.user.id),
        orderBy: (stakes, { asc }) => [asc(stakes.createdAt)]
      });

      const totalStaked = userStakes.reduce((sum, stake) =>
        sum + parseFloat(stake.amount.toString()), 0);

      // Calculate current rewards
      let currentRewards = 0;
      if (userStakes.length > 0) {
        const earliestStake = userStakes[0].createdAt;
        currentRewards = await calculateRewardsForTimestamp(req.user.id, totalStaked, earliestStake.getTime(), Date.now(), false);
      }

      // Calculate ROI
      const totalValue = totalStaked + currentRewards;
      const roi = totalStaked > 0 ? ((totalValue - totalStaked) / totalStaked) * 100 : 0;

      // Generate historical data
      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      const rewardsHistory = [];
      const priceHistory = [];
      const validatorHistory = [];

      for (let timestamp = thirtyDaysAgo; timestamp <= now; timestamp += 24 * 60 * 60 * 1000) {
        // Calculate rewards at each point in time
        const rewards = await calculateRewardsForTimestamp(req.user.id, totalStaked, userStakes[0]?.createdAt?.getTime() || timestamp, timestamp, false);
        rewardsHistory.push({ timestamp, value: rewards });

        // Simulate price variations for demo
        const basePrice = 2500; // Base ETH price in USD
        const priceVariation = Math.sin(timestamp / (2 * Math.PI * 1000000)) * 100;
        priceHistory.push({ timestamp, price: basePrice + priceVariation });

        // Generate validator metrics
        const baseValidators = 100000;
        const validatorVariation = Math.cos(timestamp / (2 * Math.PI * 1000000)) * 1000;
        validatorHistory.push({
          timestamp,
          activeValidators: Math.floor(baseValidators + validatorVariation),
          effectiveness: 95 + (Math.sin(timestamp / (2 * Math.PI * 1000000)) * 3)
        });
      }

      // Calculate network health metrics
      const networkHealth = 98.5 + (Math.random() * 1); // 98.5-99.5%
      const participationRate = 95 + (Math.random() * 3); // 95-98%
      const validatorEffectiveness = 96 + (Math.random() * 2); // 96-98%

      // Prepare response data
      const analyticsData = {
        performance: {
          roi,
          apy: 3.00, // Current fixed APY
          totalRewards: currentRewards,
          rewardsHistory
        },
        network: {
          validatorEffectiveness,
          networkHealth,
          participationRate,
          validatorHistory
        },
        portfolio: {
          totalValue,
          profitLoss: currentRewards,
          stakingPositions: [
            {
              coin: 'ETH',
              amount: totalStaked,
              value: totalValue,
              apy: 3.00
            }
          ],
          priceHistory
        }
      };

      res.json(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
  });

  // Update auth.ts registration to handle referral codes
  app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
      const newReferralCode = await generateReferralCode();

      const [user] = await db.insert(users)
        .values({
          email,
          password,
          referralCode: newReferralCode
        })
        .returning();

      res.json({ message: 'Registration successful', user });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  });

  // Get user notifications
  app.get('/api/notifications', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const notifications = await NotificationService.getUserNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  app.post('/api/notifications/:id/read', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ error: 'Invalid notification ID' });
      }

      const [updated] = await NotificationService.markAsRead(req.user.id, notificationId);
      if (!updated) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json(updated);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });

  // Add new rebalance endpoint
  app.post('/api/portfolio/rebalance', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { eth, sol, dot } = req.body;

      // Validate allocation percentages
      if (eth + sol + dot !== 100) {
        return res.status(400).json({ error: 'Allocation percentages must sum to 100%' });
      }

      // Get user's current stakes
      const userStakes = await db.query.stakes.findMany({
        where: eq(stakes.userId, req.user.id),
        orderBy: (stakes, { asc }) => [asc(stakes.createdAt)]
      });

      const totalStaked = userStakes.reduce((sum, stake) =>
        sum + parseFloat(stake.amount.toString()), 0);

      if (totalStaked < 0.01) {
        return res.status(400).json({ error: 'Minimum stake required: 0.01 ETH' });
      }

      // For now, we only support ETH, so ensure ETH allocation is 100%
      if (eth !== 100) {
        return res.status(400).json({
          error: 'Currently only ETH staking is supported. Please set ETH allocation to 100%'
        });
      }

      // Record rebalancing transaction
      await db.insert(transactions)
        .values({
          userId: req.user.id,
          type: 'rebalance',
          amount: totalStaked.toString(),
          status: 'completed',
          createdAt: new Date()
        });

      res.json({
        message: 'Portfolio rebalanced successfully',
        newAllocation: { eth, sol, dot }
      });
    } catch (error) {
      console.error('Error rebalancing portfolio:', error);
      res.status(500).json({ error: 'Failed to rebalance portfolio' });
    }
  });

  // Add delete notification endpoint
  app.delete('/api/notifications/:id', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ error: 'Invalid notification ID' });
      }

      const [deleted] = await NotificationService.deleteNotification(req.user.id, notificationId);
      if (!deleted) {
        return res.status(404).json({ error: 'Notification not found or not read' });
      }

      res.json(deleted);
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });

  //The interval is already set in startRewardsGeneration, so this line is redundant and should be removed.
  // if (!rewardsGenerationInterval) {
  //   rewardsGenerationInterval = setInterval(generateRewardsForAllActiveStakes, 3600000); // Run every 60 minutes
  // }

  const httpServer = createServer(app);

  // Add portfolio endpoint back
  app.get('/api/portfolio', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get user's stakes and calculate rewards
      const userStakes = await db.query.stakes.findMany({
        where: eq(stakes.userId, req.user.id),
        orderBy: (stakes, { asc }) => [asc(stakes.createdAt)]
      });

      const totalStaked = userStakes.reduce((sum, stake) =>
        sum + parseFloat(stake.amount.toString()), 0);

      // Calculate rewards if there are stakes
      let currentRewards = 0;
      if (userStakes.length > 0) {
        const earliestStake = userStakes[0].createdAt;
        currentRewards = await calculateRewardsForTimestamp(req.user.id, totalStaked, earliestStake.getTime(), Date.now(), false);
      }

      const portfolioData = {
        eth: {
          staked: totalStaked,
          rewards: parseFloat(currentRewards.toFixed(9)),
          apy: 3.00
        }
      };

      res.json(portfolioData);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
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

  return httpServer;
}

// Placeholder function - needs actual implementation
async function generateReferralCode(): Promise<string> {
  return 'REF-XXXXXXX'; // Replace with actual code to generate referral code
}