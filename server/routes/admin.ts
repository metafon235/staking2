import { Router } from 'express';
import { requireAdmin } from '../middleware/admin';
//import { db } from '@db'; // Removed
//import { users, stakes, transactions, stakingSettings } from '@db/schema'; // Removed
import { desc, sql, eq } from 'drizzle-orm';
import { z } from 'zod';
//import { scrypt, randomBytes, timingSafeEqual } from "crypto"; // Removed
//import { promisify } from "util"; // Removed

const router = Router();
//const scryptAsync = promisify(scrypt); // Removed

// Mock admin credentials
const MOCK_ADMIN = {
  id: 1,
  email: 'admin@example.com',
  password: 'admin123',
  isAdmin: true
};

// Public routes (no middleware)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check against mock admin credentials
    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
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

      res.json({
        message: "Admin login successful",
        user: {
          id: MOCK_ADMIN.id,
          email: MOCK_ADMIN.email,
          isAdmin: MOCK_ADMIN.isAdmin
        }
      });
    } else {
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
    if (!req.session?.adminId || !req.session?.isAdminSession) {
      return res.status(401).json({ message: "No active admin session" });
    }

    // Return mock admin data
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

// Mock overview data
const MOCK_OVERVIEW = {
  users: 150,
  totalStaked: 1250.75,
  transactions: 450,
  stakingConfig: [
    {
      id: 1,
      coinSymbol: 'ETH',
      displayedApy: '4.50',
      actualApy: '4.20',
      minStakeAmount: '0.1',
      updatedAt: new Date(),
    }
  ],
  systemHealth: {
    cdpApiStatus: 'operational',
    databaseStatus: 'healthy',
    lastSync: new Date().toISOString()
  }
};

// Get system overview
router.get('/overview', async (_req, res) => {
  res.json(MOCK_OVERVIEW);
});

// Mock users data
const MOCK_USERS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  email: `user${i + 1}@example.com`,
  walletAddress: `0x${(Math.random() * 1e50).toString(16)}`,
  referralCode: `REF${i + 1}`,
  isAdmin: false,
  createdAt: new Date(Date.now() - Math.random() * 10000000000),
  stakes: Array.from({ length: Math.floor(Math.random() * 3) }, (_, j) => ({
    id: j + 1,
    amount: (Math.random() * 10).toFixed(2),
    status: 'active',
    createdAt: new Date(Date.now() - Math.random() * 5000000000)
  }))
}));

// Get all users with their stakes
router.get('/users', async (_req, res) => {
  res.json(MOCK_USERS);
});

// Mock staking settings
const MOCK_STAKING_SETTINGS = [
  {
    id: 1,
    coinSymbol: 'ETH',
    displayedApy: '4.50',
    actualApy: '4.20',
    minStakeAmount: '0.1',
    updatedAt: new Date()
  },
  {
    id: 2,
    coinSymbol: 'SOL',
    displayedApy: '6.50',
    actualApy: '6.20',
    minStakeAmount: '1.0',
    updatedAt: new Date()
  }
];

// Get staking settings
router.get('/settings/staking', async (_req, res) => {
  res.json(MOCK_STAKING_SETTINGS);
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

    const { coinSymbol } = req.params;
    const settingIndex = MOCK_STAKING_SETTINGS.findIndex(s => s.coinSymbol === coinSymbol);

    if (settingIndex === -1) {
      return res.status(404).json({ error: 'Staking settings not found' });
    }

    MOCK_STAKING_SETTINGS[settingIndex] = {
      ...MOCK_STAKING_SETTINGS[settingIndex],
      ...validation.data,
      updatedAt: new Date()
    };

    res.json(MOCK_STAKING_SETTINGS[settingIndex]);
  } catch (error) {
    console.error('Error updating staking settings:', error);
    res.status(500).json({ error: 'Failed to update staking settings' });
  }
});

export default router;