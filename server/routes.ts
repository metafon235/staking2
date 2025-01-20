import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { z } from "zod";
import { stakes, rewards, transactions, users, referralRewards } from "@db/schema";
import { eq, count, avg, sql, sum, and, gt } from "drizzle-orm";

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

async function generateRewardsForAllActiveStakes() {
  try {
    // Get all active stakes
    const activeStakes = await db.query.stakes.findMany({
      where: eq(stakes.status, 'active'),
    });

    // Group stakes by user
    const userStakes = activeStakes.reduce((acc, stake) => {
      if (!acc[stake.userId]) {
        acc[stake.userId] = [];
      }
      acc[stake.userId].push(stake);
      return acc;
    }, {} as Record<number, typeof activeStakes>);

    // Generate rewards for each user's total staked amount
    for (const [userId, stakes] of Object.entries(userStakes)) {
      const totalStaked = stakes.reduce((sum, stake) =>
        sum + parseFloat(stake.amount.toString()), 0);

      if (totalStaked >= 0.01) {
        const yearlyRate = 0.03; // 3% APY
        const minutelyRate = yearlyRate / (365 * 24 * 60);
        const reward = totalStaked * minutelyRate;

        if (reward >= 0.00000001) {
          await db.insert(transactions)
            .values({
              userId: parseInt(userId),
              type: 'reward',
              amount: reward.toFixed(9),
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


// Add before registerRoutes function
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const newsCache = {
  data: null as any[] | null,
  timestamp: 0
};

// Mock news data for fallback
const FALLBACK_NEWS = [
  {
    title: "Ethereum Staking Continues to Grow",
    description: "The total amount of ETH staked continues to rise as more validators join the network.",
    url: "https://ethereum.org",
    thumb_2x: "https://ethereum.org/static/ethereum-logo.png",
    published_at: new Date().toISOString()
  },
  {
    title: "ETH 2.0 Development Update",
    description: "Latest progress on Ethereum network upgrades and improvements.",
    url: "https://ethereum.org",
    thumb_2x: "https://ethereum.org/static/ethereum-logo.png",
    published_at: new Date().toISOString()
  }
];

async function fetchCryptoNews() {
  const now = Date.now();

  // Return cached data if it's still fresh
  if (newsCache.data && (now - newsCache.timestamp) < CACHE_DURATION) {
    return newsCache.data;
  }

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=1&interval=daily',
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.warn('Failed to fetch from CoinGecko, using fallback data');
      return FALLBACK_NEWS;
    }

    // Transform market data into news-like format
    const marketData = await response.json();
    const priceChange = ((marketData.prices[1][1] - marketData.prices[0][1]) / marketData.prices[0][1]) * 100;

    const news = [
      {
        title: `Ethereum ${priceChange >= 0 ? 'Rises' : 'Drops'} ${Math.abs(priceChange).toFixed(2)}% in 24h`,
        description: `Current ETH price movements and market analysis show ${priceChange >= 0 ? 'positive' : 'negative'} momentum.`,
        url: "https://www.coingecko.com/en/coins/ethereum",
        thumb_2x: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        published_at: new Date().toISOString()
      },
      ...FALLBACK_NEWS
    ];

    // Cache the results
    newsCache.data = news;
    newsCache.timestamp = now;

    return news;
  } catch (error) {
    console.error('Error fetching crypto news:', error);
    // Return fallback data if API fails
    return FALLBACK_NEWS;
  }
}

export function registerRoutes(app: Express): Server {
  // Important: Setup auth first before other routes
  setupAuth(app);

  // Add new route for news
  app.get('/api/news', async (_req, res) => {
    try {
      const news = await fetchCryptoNews();
      res.json(news);
    } catch (error) {
      console.error('Error fetching news:', error);
      // Always return some data to prevent frontend errors
      res.json(FALLBACK_NEWS);
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

      // Calculate current total accumulated rewards
      const currentRewards = await calculateRewardsForTimestamp(
        req.user.id,
        totalStaked,
        earliestStake.getTime(),
        Date.now(),
        false
      );

      // Record a per-minute reward for transaction
      await calculateRewardsForTimestamp(
        req.user.id,
        totalStaked,
        Date.now() - 60000, // One minute ago
        Date.now(),
        true
      );

      // Calculate monthly rewards based on 3% APY
      const monthlyRewards = (totalStaked * 0.03) / 12;

      // Generate rewards history
      const now = Date.now();
      const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
      const rewardsHistory = [];

      // Generate data points every 5 minutes for the last week
      for (let timestamp = oneWeekAgo; timestamp <= now; timestamp += 5 * 60 * 1000) {
        const rewards = await calculateRewardsForTimestamp(
          req.user.id,
          totalStaked,
          earliestStake.getTime(),
          timestamp,
          false
        );
        rewardsHistory.push({
          timestamp,
          rewards: parseFloat(rewards.toFixed(9))
        });
      }

      // Generate response data with appropriate decimal precision
      const stakingData = {
        totalStaked: parseFloat(totalStaked.toFixed(6)), // 6 decimal places for total staked
        rewards: parseFloat(currentRewards.toFixed(9)), // 9 decimal places for rewards
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

        // Record rewards withdrawal
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
        const [updatedStake] = await db
          .update(stakes)
          .set({
            amount: (totalStaked - remainingAmount).toString(),
            updatedAt: new Date(),
          })
          .where(eq(stakes.id, userStakes[0].id))
          .returning();

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

  // Fix the reward calculation function
  async function calculateRewardsForTimestamp(userId: number, stakedAmount: number, startTimeMs: number, endTimeMs: number, forTransaction: boolean = false): Promise<number> {
    // Only generate rewards if stake amount is at least 0.01 ETH
    if (stakedAmount < 0.01) {
      return 0;
    }

    const timePassedMs = endTimeMs - startTimeMs;
    const minutesElapsed = timePassedMs / (60 * 1000); // Convert to minutes
    const yearlyRate = 0.03; // 3% APY
    const minutelyRate = yearlyRate / (365 * 24 * 60); // Convert yearly rate to per-minute rate

    if (forTransaction) {
      const reward = stakedAmount * minutelyRate; // Calculate one minute's reward
      // Record transaction if it's a meaningful reward
      if (reward >= 0.00000001) { // Threshold at 8 decimals
        await recordRewardTransaction(userId, reward);
      }
      return reward;
    } else {
      // For total rewards calculation (withdrawal, display), calculate accumulated rewards
      return stakedAmount * minutelyRate * minutesElapsed;
    }
  }

  // Generate a unique referral code
  async function generateReferralCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const existing = await db.query.users.findFirst({
        where: eq(users.referralCode, code)
      });

      if (!existing) {
        isUnique = true;
        return code;
      }
    }

    throw new Error('Failed to generate unique referral code');
  }

  async function recordRewardTransaction(userId: number, reward: number) {
    if (reward > 0) {
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
        const [transaction] = await db.insert(transactions)
          .values({
            userId,
            type: 'reward',
            amount: reward.toFixed(9), // Per-minute reward with 9 decimal precision
            status: 'completed',
            createdAt: new Date()
          })
          .returning();

        // Calculate and record referral rewards
        const user = await db.query.users.findFirst({
          where: eq(users.id, userId),
          columns: {
            referrerId: true
          }
        });

        if (user?.referrerId) {
          const referralReward = reward * 0.01; // 1% referral reward
          await db.insert(transactions)
            .values({
              userId: user.referrerId,
              type: 'referral_reward',
              amount: referralReward.toFixed(9),
              status: 'completed',
              createdAt: new Date()
            });

          await db.insert(referralRewards)
            .values({
              id: undefined, // Let the database auto-generate this
              referrerId: user.referrerId,
              referredId: userId,
              rewardId: transaction.id,
              amount: referralReward.toString(),
              createdAt: new Date()
            });
        }
      }
    }
  }

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

  // Add portfolio endpoint
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

  // Add settings endpoints
  app.get('/api/settings', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user.id),
        columns: {
          walletAddress: true,
          referralCode: true
        }
      });

      // Get referral statistics
      const referrals = await db.select({
        count: count(),
      })
        .from(users)
        .where(eq(users.referrerId, req.user.id));

      const referralRewardsSum = await db.select({
        total: sql<string>`sum(amount)::numeric`
      })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, req.user.id),
            eq(transactions.type, 'referral_reward')
          )
        );

      const totalReferrals = parseInt(referrals[0].count.toString());
      const totalRewards = parseFloat(referralRewardsSum[0]?.total || '0');

      // Generate referral code if not exists
      let referralCode = user?.referralCode;
      if (!referralCode) {
        referralCode = await generateReferralCode();
        await db.update(users)
          .set({ referralCode })
          .where(eq(users.id, req.user.id));
      }

      res.json({
        walletAddress: user?.walletAddress || '',
        referralCode,
        referralStats: {
          totalReferrals,
          totalRewards
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.post('/api/settings/wallet', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { walletAddress } = req.body;

      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
      }

      // Update user's wallet address
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
        return res.status(401).json({ error: 'Not authenticated' });
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

      res.json({
        portfolio: {
          totalStaked,
          currentRewards,
          totalValue,
          roi
        },
        history: {
          rewards: rewardsHistory,
          prices: priceHistory,
          validators: validatorHistory
        },
        network: {
          health: networkHealth,
          participationRate,
          validatorEffectiveness
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
  });

  // Update auth.ts registration to handle referral codes
  app.post('/api/register', async (req, res) => {
    const { email, password, referralCode } = req.body;

    try {
      let referrerId: number | null = null;

      if (referralCode) {
        const referrer = await db.query.users.findFirst({
          where: eq(users.referralCode, referralCode),
          columns: {
            id: true
          }
        });

        if (referrer) {
          referrerId = referrer.id;
        }
      }

      const newReferralCode = await generateReferralCode();

      const [user] = await db.insert(users)
        .values({
          email,
          password,
          referrerId,
          referralCode: newReferralCode
        })
        .returning();

      res.json({ message: 'Registration successful', user });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  });

  if (!rewardsGenerationInterval) {
    rewardsGenerationInterval = setInterval(generateRewardsForAllActiveStakes, 60000); // Run every minute
  }

  const httpServer = createServer(app);
  return httpServer;
}