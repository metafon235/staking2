import { Router } from 'express';
import { requireAdmin } from '../middleware/admin';
import { db } from '@db';
import { users, stakes, transactions, stakingSettings } from '@db/schema';
import { desc, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Protect all admin routes
router.use(requireAdmin);

// Get system overview
router.get('/overview', async (_req, res) => {
  try {
    const [
      userCount,
      totalStaked,
      totalTransactions,
      stakingConfig
    ] = await Promise.all([
      // Get total users
      db.select({ count: sql<number>`count(*)` }).from(users),
      // Get total staked amount
      db.select({ 
        total: sql<string>`sum(amount)::numeric` 
      }).from(stakes),
      // Get total transactions
      db.select({ count: sql<number>`count(*)` }).from(transactions),
      // Get staking settings
      db.query.stakingSettings.findMany()
    ]);

    res.json({
      users: userCount[0].count,
      totalStaked: parseFloat(totalStaked[0]?.total || '0'),
      transactions: totalTransactions[0].count,
      stakingConfig,
      systemHealth: {
        cdpApiStatus: 'operational',
        databaseStatus: 'healthy',
        lastSync: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview data' });
  }
});

// Get all users with their stakes
router.get('/users', async (_req, res) => {
  try {
    const userList = await db.query.users.findMany({
      with: {
        stakes: true
      },
      orderBy: desc(users.createdAt)
    });

    res.json(userList);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get staking settings
router.get('/settings/staking', async (_req, res) => {
  try {
    const settings = await db.query.stakingSettings.findMany();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching staking settings:', error);
    res.status(500).json({ error: 'Failed to fetch staking settings' });
  }
});

// Update staking settings schema
const updateStakingSettingsSchema = z.object({
  coinSymbol: z.string(),
  displayedApy: z.number().min(0).max(100),
  actualApy: z.number().min(0).max(100),
  minStakeAmount: z.string()
});

// Update staking settings
router.put('/settings/staking/:coinSymbol', async (req, res) => {
  try {
    const validation = updateStakingSettingsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid settings data',
        details: validation.error.issues
      });
    }

    const { coinSymbol, displayedApy, actualApy, minStakeAmount } = validation.data;

    // Convert numbers to strings for database storage
    const [updated] = await db
      .update(stakingSettings)
      .set({
        displayedApy: displayedApy.toString(),
        actualApy: actualApy.toString(),
        minStakeAmount,
        updatedAt: new Date(),
        updatedBy: req.user?.id
      })
      .where(sql`coin_symbol = ${coinSymbol}`)
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Staking settings not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating staking settings:', error);
    res.status(500).json({ error: 'Failed to update staking settings' });
  }
});

export default router;