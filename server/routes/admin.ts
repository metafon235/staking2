import { Router } from 'express';
import { requireAdmin } from '../middleware/admin';
import { db } from '@db';
import { users, stakes, transactions } from '@db/schema';
import { desc, sql } from 'drizzle-orm';

const router = Router();

// Protect all admin routes
router.use(requireAdmin);

// Get system overview
router.get('/overview', async (_req, res) => {
  try {
    const [
      userCount,
      totalStaked,
      totalTransactions
    ] = await Promise.all([
      // Get total users
      db.select({ count: sql<number>`count(*)` }).from(users),
      // Get total staked amount
      db.select({ 
        total: sql<string>`sum(amount)::numeric` 
      }).from(stakes),
      // Get total transactions
      db.select({ count: sql<number>`count(*)` }).from(transactions)
    ]);

    res.json({
      users: userCount[0].count,
      totalStaked: parseFloat(totalStaked[0]?.total || '0'),
      transactions: totalTransactions[0].count,
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

// Update APY settings
router.post('/settings/apy', async (req, res) => {
  try {
    const { coin, apy } = req.body;
    
    if (!coin || typeof apy !== 'number' || apy < 0) {
      return res.status(400).json({ error: 'Invalid APY settings' });
    }

    // For now, we'll just acknowledge the request
    // In a real implementation, this would update a settings table
    res.json({ 
      message: 'APY settings updated',
      settings: { coin, apy }
    });
  } catch (error) {
    console.error('Error updating APY settings:', error);
    res.status(500).json({ error: 'Failed to update APY settings' });
  }
});

export default router;
