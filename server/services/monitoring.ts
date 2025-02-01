
import { PivxWalletService } from './pivx';
import { db } from '@db';
import { stakes } from '@db/schema';
import { eq } from 'drizzle-orm';

export class StakingMonitor {
  private wallet: PivxWalletService;
  private checkInterval: NodeJS.Timer;

  constructor(wallet: PivxWalletService) {
    this.wallet = wallet;
  }

  start() {
    // Check staking status every 5 minutes
    this.checkInterval = setInterval(() => this.checkStakingStatus(), 5 * 60 * 1000);
    console.log('Staking monitoring started');
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  private async checkStakingStatus() {
    try {
      // Get wallet info
      const walletInfo = await this.wallet.getWalletInfo();
      
      // Check if staking is active
      if (!walletInfo.staking) {
        console.error('Warning: Staking is not active');
      }

      // Check wallet balance
      if (walletInfo.balance < 100) {
        console.error('Warning: Low wallet balance');
      }

      // Check active stakes
      const activeStakes = await db
        .select()
        .from(stakes)
        .where(eq(stakes.status, 'active'));

      console.log(`Monitoring: ${activeStakes.length} active stakes`);
      console.log('Wallet status:', {
        balance: walletInfo.balance,
        staking: walletInfo.staking,
        connections: walletInfo.connections,
      });

    } catch (error) {
      console.error('Monitoring error:', error);
    }
  }
}

const pivxWallet = new PivxWalletService();
export const stakingMonitor = new StakingMonitor(pivxWallet);
