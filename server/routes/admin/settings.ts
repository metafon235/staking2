import { Router } from 'express';
import { db } from '@db';
import { stakingSettings } from '@db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get master wallet settings
router.get('/', async (_req, res) => {
  try {
    const settings = await db.query.stakingSettings.findFirst({
      orderBy: (settings, { desc }) => [desc(settings.updatedAt)]
    });

    res.json({
      masterWalletAddress: settings?.coinSymbol || '',
      updatedAt: settings?.updatedAt || null,
      updatedBy: settings?.updatedBy || null
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({ message: "Failed to fetch admin settings" });
  }
});

// Update master wallet
router.post('/wallet', async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { walletAddress } = req.body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ message: "Invalid wallet address" });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ message: "Invalid Ethereum address format" });
    }

    // Update or create settings
    const [settings] = await db.insert(stakingSettings)
      .values({
        coinSymbol: walletAddress,
        displayedApy: "3.00",
        actualApy: "3.57",
        minStakeAmount: "0.01",
        updatedBy: req.user.id
      })
      .onConflictDoUpdate({
        target: stakingSettings.coinSymbol,
        set: {
          coinSymbol: walletAddress,
          updatedAt: new Date(),
          updatedBy: req.user.id
        }
      })
      .returning();

    res.json({
      message: "Master wallet updated successfully",
      settings
    });
  } catch (error) {
    console.error('Error updating master wallet:', error);
    res.status(500).json({ message: "Failed to update master wallet" });
  }
});

export default router;
