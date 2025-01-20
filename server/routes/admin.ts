import { Router } from 'express';
import { requireAdmin } from '../middleware/admin';
import { z } from 'zod';
import { db } from '@db';
import { users, stakes, stakingSettings } from '@db/schema';
import { eq, sum, count } from 'drizzle-orm';

const router = Router();

// Mock admin credentials
const MOCK_ADMIN = {
  id: 1,
  email: 'monerominercom@gmail.com',
  password: 'metafon23',
  isAdmin: true
};

// Public routes (no middleware)
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

// Protected routes below this point
router.use(requireAdmin);

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

// Get system overview for admin dashboard
router.get('/overview', async (req, res) => {
  try {
    // Get total users count
    const userCount = await db.select({ count: count() }).from(users);

    // Get total staked amount
    const totalStaked = await db.select({ 
      sum: sum(stakes.amount) 
    }).from(stakes).where(eq(stakes.status, 'active'));

    // Get total transactions count
    const transactionCount = await db.select({ count: count() }).from(stakes);

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
      totalStaked: parseFloat(totalStaked[0].sum ?? '0'),
      transactions: transactionCount[0].count ?? 0,
      stakingConfig: config.map(cfg => ({
        coinSymbol: cfg.coinSymbol,
        displayedApy: parseFloat(cfg.displayedApy.toString()),
        actualApy: parseFloat(cfg.actualApy.toString()),
        minStakeAmount: cfg.minStakeAmount.toString()
      })),
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