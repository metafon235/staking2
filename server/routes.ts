import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import adminRoutes from './routes/admin';
import { z } from 'zod';
import { db } from '@db';
import { stakes, rewards, transactions, users } from '@db/schema';
import { eq, and, count, sql } from 'drizzle-orm';

export function registerRoutes(app: Express): Server {
  // Important: Setup auth first before other routes
  setupAuth(app);

  // Register admin routes - make sure this comes before other routes
  // Important: Do NOT apply any middleware here
  app.use('/api/admin', adminRoutes);

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
      // Try to get real network stats first
      const realStats = await masterWallet.getNetworkStats();

      if (realStats) {
        // Use real data
        const stats = {
          current: {
            tvl: realStats.totalStaked,
            validators: realStats.activeValidators,
            avgStake: realStats.totalStaked / realStats.activeValidators,
            rewards: realStats.networkRewards
          },
          history: await generateHistoricalData(symbol, BASE_STATS[symbol as keyof typeof BASE_STATS]),
          lastUpdated: new Date().toISOString()
        };

        // Update cache
        statsCache.set(symbol, {
          data: stats,
          timestamp: Date.now()
        });

        return res.json(stats);
      }

      // Fallback to mock data if real data not available
      const now = Date.now();
      const cached = statsCache.get(symbol);

      if (cached && (now - cached.timestamp) < 60000) {
        return res.json(cached.data);
      }

      const baseStats = BASE_STATS[symbol as keyof typeof BASE_STATS];
      const current = await getCurrentNetworkStats(symbol);
      const history = await generateHistoricalData(symbol, baseStats);

      const stats = {
        current,
        history,
        lastUpdated: new Date().toISOString()
      };

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

      // Add stake through master wallet
      const newStake = await masterWallet.addUserStake(req.user.id, amount);

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

  // CDP Webhook endpoint
  app.post('/api/cdp/webhook', async (req: any, res: any) => { // Added any type for req and res
    try {
      console.log('Received CDP webhook:', {
        headers: req.headers,
        body: req.body
      });

      const signature = req.headers['x-webhook-signature'];
      if (!signature || typeof signature !== 'string') {
        console.error('Missing CDP webhook signature');
        return res.status(401).json({ error: 'Missing signature' });
      }

      // Verify webhook signature using CDP client
      const payload = JSON.stringify(req.body);
      if (!cdpClient.verifyWebhookSignature(signature, payload)) {
        console.error('Invalid CDP webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const { event_type, data } = req.body;
      console.log('Processing CDP webhook event:', { event_type, data });

      switch (event_type) {
        case 'STAKE_CREATED':
          console.log('Updating stake status for created stake:', data);
          // Update stake status in database
          await db.update(stakes)
            .set({
              status: 'active',
              cdpStakeId: data.stake_id,
              cdpValidatorId: data.validator_id,
              updatedAt: new Date()
            })
            .where(eq(stakes.cdpStakeId, data.stake_id));
          break;

        case 'STAKE_UPDATED':
          console.log('Updating stake status:', data);
          // Update stake status
          await db.update(stakes)
            .set({
              status: data.status.toLowerCase(),
              updatedAt: new Date()
            })
            .where(eq(stakes.cdpStakeId, data.stake_id));
          break;

        case 'REWARD_DISTRIBUTED':
          console.log('Recording new reward distribution:', data);
          // Record new reward
          const [reward] = await db.insert(rewards)
            .values({
              stakeId: data.stake_id,
              amount: data.amount,
              cdpRewardId: data.reward_id,
              createdAt: new Date()
            })
            .returning();

          // Record reward transaction
          await db.insert(transactions)
            .values({
              userId: data.user_id,
              type: 'reward',
              amount: data.amount,
              status: 'completed',
              cdpTransactionId: data.transaction_id,
              createdAt: new Date()
            });

          console.log('Reward recorded:', { reward });
          break;

        default:
          console.warn('Unhandled CDP webhook event type:', event_type);
      }

      console.log('CDP webhook processed successfully');
      res.json({ status: 'success' });
    } catch (error) {
      console.error('CDP webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Initialize master wallet when server starts
  masterWallet.initialize().catch(error => {
    console.error('Failed to initialize master wallet:', error);
    process.exit(1);
  });

  //Important:This part should be after all routes are registered.
  if (!rewardsGenerationInterval) {
    rewardsGenerationInterval = setInterval(generateRewardsForAllActiveStakes, 60000); // Run every minute
  }

  const httpServer = createServer(app);
  return httpServer;
}

// Mock data and helper functions
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
    url: "https://ethereum.org/staking",
    thumb_2x: "https://ethereum.org/static/ethereum-logo.png",
    published_at: new Date().toISOString()
  },
  {
    title: "ETH 2.0 Development Update",
    description: "Latest progress on Ethereum network upgrades and improvements.",
    url: "https://ethereum.org/upgrades",
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

  // Return mock news data
  newsCache.data = FALLBACK_NEWS;
  newsCache.timestamp = now;
  return newsCache.data;
}

// Network base statistics
const BASE_STATS = {
  eth: {
    tvl: 1000000,
    validators: 500,
    avgStake: 32,
    rewards: 450000
  },
  sol: {
    tvl: 500000,
    validators: 1000,
    avgStake: 100,
    rewards: 250000
  }
};

// Cache for network statistics
interface StatsCache {
  data: any;
  timestamp: number;
}

const statsCache = new Map<string, StatsCache>();

async function generateHistoricalData(symbol: string, baseStats: any) {
  const now = Date.now();
  const history = [];

  // Generate 30 days of historical data
  for (let i = 0; i < 30; i++) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    const variationPercent = (Math.random() - 0.5) * 0.1; // +/- 5% variation

    history.unshift({
      timestamp,
      tvl: baseStats.tvl * (1 + variationPercent),
      validators: Math.floor(baseStats.validators * (1 + variationPercent)),
      avgStake: baseStats.avgStake * (1 + variationPercent),
      rewards: baseStats.rewards * (1 + variationPercent)
    });
  }

  return history;
}

async function getCurrentNetworkStats(symbol: string) {
  const baseStats = BASE_STATS[symbol as keyof typeof BASE_STATS];
  if (!baseStats) return null;

  return {
    tvl: baseStats.tvl + (Math.random() * 10000),
    validators: baseStats.validators + Math.floor(Math.random() * 100),
    avgStake: baseStats.avgStake + (Math.random() * 2),
    rewards: baseStats.rewards + (Math.random() * 1000)
  };
}

// Mock function for calculating network rewards
async function calculateNetworkRewards(symbol: string) {
  const baseStats = BASE_STATS[symbol as keyof typeof BASE_STATS];
  return baseStats ? baseStats.rewards + (Math.random() * 1000) : 0;
}

let rewardsGenerationInterval: NodeJS.Timeout | null = null;

async function generateRewardsForAllActiveStakes() {
  // Mock function for reward generation
  console.log('Generating rewards for all active stakes...');
}

const masterWallet = {
  initialize: async () => {
    console.log('Mock master wallet initialized');
    return true;
  },
  addUserStake: async (userId: number, amount: string) => {
    return {
      id: Math.floor(Math.random() * 1000),
      userId,
      amount,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },
  getNetworkStats: async () => {
    return {
      totalStaked: 1000000,
      activeValidators: 500,
      networkRewards: 450000
    };
  }
};

const cdpClient = {
  verifyWebhookSignature: (signature: string, payload: string) => {
    // Mock signature verification
    return true;
  }
};

export { masterWallet, cdpClient };