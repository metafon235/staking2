import { Router } from 'express';
import { requireAdmin } from '../middleware/admin';
import { z } from 'zod';
import { db } from '@db';
import { users, stakes, stakingSettings, transactions } from '@db/schema';
import { eq, sum, count, and, gt } from 'drizzle-orm';

const router = Router();

// Mock admin data
const MOCK_ADMIN = {
  id: 1,
  email: 'monerominercom@gmail.com',
  password: 'metafon23',
  isAdmin: true
};

// Admin login route
router.post('/login', async (req, res) => {
  try {
    console.log('Admin login attempt:', req.body);
    const { email, password } = req.body;

    // Check against mock admin credentials
    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
      console.log('Admin credentials valid, setting session');

      // Set admin session
      if (req.session) {
        req.session.adminId = MOCK_ADMIN.id;
        req.session.isAdminSession = true;
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            resolve();
          });
        });
      }

      console.log('Admin session saved:', req.session);
      res.json({
        message: "Admin login successful",
        user: {
          id: MOCK_ADMIN.id,
          email: MOCK_ADMIN.email,
          isAdmin: MOCK_ADMIN.isAdmin
        }
      });
    } else {
      console.log('Invalid admin credentials');
      res.status(401).json({ message: "Invalid admin credentials" });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/session', async (req, res) => {
  try {
    console.log('Admin session check:', req.session);
    if (!req.session?.adminId || !req.session?.isAdminSession) {
      console.log('No active admin session found');
      return res.status(401).json({ message: "No active admin session" });
    }

    console.log('Valid admin session found');
    res.json({
      user: {
        id: MOCK_ADMIN.id,
        email: MOCK_ADMIN.email,
        isAdmin: MOCK_ADMIN.isAdmin
      }
    });
  } catch (error) {
    console.error('Admin session check error:', error);
    res.status(500).json({ message: "Session check failed" });
  }
});

// Get all users
router.get('/users', async (_req, res) => {
  try {
    const users = await db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        walletAddress: true,
        referralCode: true,
        isAdmin: true,
        createdAt: true
      },
      with: {
        stakes: {
          columns: {
            amount: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Don't allow deleting the admin user
    if (userId === MOCK_ADMIN.id) {
      return res.status(403).json({ message: "Cannot delete admin user" });
    }

    // First check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user's stakes first
    await db.delete(stakes).where(eq(stakes.userId, userId));

    // Then delete the user's transactions
    await db.delete(transactions).where(eq(transactions.userId, userId));

    // Finally delete the user
    await db.delete(users).where(eq(users.id, userId));

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// Get system overview for admin dashboard
router.get('/overview', async (req, res) => {
  try {
    // Constants for APY calculations
    const DISPLAYED_APY = 3.00;  // 3% shown to users
    const ACTUAL_APY = 3.57;     // 3.57% actual APY
    const APY_DIFFERENCE = ACTUAL_APY - DISPLAYED_APY;

    // Get total users count
    const userCount = await db.select({ count: count() }).from(users);

    // Get total staked amount
    const totalStaked = await db.select({ 
      sum: sum(stakes.amount) 
    }).from(stakes).where(eq(stakes.status, 'active'));

    // Get total transactions count
    const transactionCount = await db.select({ count: count() }).from(stakes);

    const totalStakedAmount = parseFloat(totalStaked[0].sum ?? '0');

    // Calculate accumulated admin rewards (total rewards from APY difference)
    const activeStakes = await db.query.stakes.findMany({
      where: eq(stakes.status, 'active'),
      orderBy: (stakes, { asc }) => [asc(stakes.createdAt)]
    });

    let totalAdminRewards = 0;
    const now = Date.now();

    for (const stake of activeStakes) {
      const stakeTimeMs = now - stake.createdAt.getTime();
      const yearsStaked = stakeTimeMs / (365 * 24 * 60 * 60 * 1000);
      const stakeAmount = parseFloat(stake.amount.toString());

      // Calculate admin's portion of rewards (0.57% APY)
      const adminRewards = stakeAmount * (APY_DIFFERENCE / 100) * yearsStaked;
      totalAdminRewards += adminRewards;
    }

    // Calculate monthly and yearly projected earnings based on current TVL
    const monthlyEarnings = (totalStakedAmount * (APY_DIFFERENCE / 100)) / 12;
    const yearlyEarnings = totalStakedAmount * (APY_DIFFERENCE / 100);

    // Get staking settings
    const config = await db.select().from(stakingSettings);

    // Mock system health data (this should be replaced with real monitoring)
    const systemHealth = {
      cdpApiStatus: 'operational',
      databaseStatus: 'healthy',
      lastSync: new Date().toISOString()
    };

    res.json({
      users: userCount[0].count ?? 0,
      totalStaked: totalStakedAmount,
      transactions: transactionCount[0].count ?? 0,
      stakingConfig: [{
        coinSymbol: 'ETH',
        displayedApy: DISPLAYED_APY,
        actualApy: ACTUAL_APY,
        minStakeAmount: '0.01'
      }],
      adminRewards: {
        current: parseFloat(totalAdminRewards.toFixed(9)), // Current accumulated admin rewards
        monthly: parseFloat(monthlyEarnings.toFixed(9)),   // Projected monthly earnings
        yearly: parseFloat(yearlyEarnings.toFixed(9))      // Projected yearly earnings
      },
      systemHealth
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({ message: "Failed to fetch overview data" });
  }
});

router.post('/logout', (req, res) => {
  console.log('Admin logout request');
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Admin logout error:', err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Admin logout successful" });
    });
  } else {
    res.json({ message: "Admin logout successful" });
  }
});

// Update staking settings
router.put('/settings/staking/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { displayedApy, actualApy, minStakeAmount } = req.body;

    await db.update(stakingSettings)
      .set({
        displayedApy: displayedApy.toString(),
        actualApy: actualApy.toString(),
        minStakeAmount: minStakeAmount.toString(),
        updatedAt: new Date(),
        updatedBy: req.session?.adminId
      })
      .where(eq(stakingSettings.coinSymbol, symbol));

    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error('Error updating staking settings:', error);
    res.status(500).json({ message: "Failed to update settings" });
  }
});

export default router;