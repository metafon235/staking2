import { Router } from 'express';
import { requireAdmin } from '../middleware/admin';
import { db } from '@db';
import { users, stakes, transactions, stakingSettings } from '@db/schema';
import { desc, sql, eq } from 'drizzle-orm';
import { z } from 'zod';
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const router = Router();
const scryptAsync = promisify(scrypt);

// Admin login endpoint - no middleware here
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!admin || !admin.isAdmin) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    try {
      const [hashedPassword, salt] = admin.password.split(".");
      if (!hashedPassword || !salt) {
        console.error('Invalid password format stored');
        return res.status(500).json({ message: "Internal server error" });
      }

      const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
      const suppliedPasswordBuf = (await scryptAsync(
        password,
        salt,
        64
      )) as Buffer;

      const isMatch = timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // Set admin user in session with specific flag
      if (req.session) {
        req.session.adminId = admin.id;
        req.session.isAdminSession = true;
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            resolve();
          });
        });
      }

      res.json({
        message: "Admin login successful",
        user: {
          id: admin.id,
          email: admin.email,
          isAdmin: admin.isAdmin
        }
      });
    } catch (error) {
      console.error('Password verification error:', error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Check admin session status
router.get('/session', async (req, res) => {
  try {
    if (!req.session?.adminId || !req.session?.isAdminSession) {
      return res.status(401).json({ message: "No active admin session" });
    }

    const admin = await db.query.users.findFirst({
      where: eq(users.id, req.session.adminId)
    });

    if (!admin || !admin.isAdmin) {
      return res.status(401).json({ message: "Invalid admin session" });
    }

    res.json({
      user: {
        id: admin.id,
        email: admin.email,
        isAdmin: admin.isAdmin
      }
    });
  } catch (error) {
    console.error('Admin session check error:', error);
    res.status(500).json({ message: "Session check failed" });
  }
});

// Admin logout
router.post('/logout', (req, res) => {
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

// Protect all other admin routes
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
      users: parseInt(userCount[0].count.toString()),
      totalStaked: parseFloat(totalStaked[0]?.total || '0'),
      transactions: parseInt(totalTransactions[0].count.toString()),
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
      orderBy: desc(users.createdAt)
    });

    // Get stakes for each user
    const usersWithStakes = await Promise.all(
      userList.map(async (user) => {
        const userStakes = await db.query.stakes.findMany({
          where: sql`user_id = ${user.id}`
        });
        return {
          ...user,
          stakes: userStakes
        };
      })
    );

    res.json(usersWithStakes);
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