import { cdpClient } from './client';
import { db } from '@db';
import { stakes, transactions } from '@db/schema';
import { eq } from 'drizzle-orm';

class MasterStakingWallet {
  private static instance: MasterStakingWallet;
  private masterStakeId: string | null = null;
  private validatorId: string | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): MasterStakingWallet {
    if (!MasterStakingWallet.instance) {
      MasterStakingWallet.instance = new MasterStakingWallet();
    }
    return MasterStakingWallet.instance;
  }

  async initialize() {
    try {
      console.log('Initializing master staking wallet');
      // Get existing stakes from CDP
      const stakes = await cdpClient.listStakes();

      if (stakes && Array.isArray(stakes) && stakes.length > 0) {
        // Use the first active stake as master stake
        const activeStake = stakes.find(stake => stake.status === 'ACTIVE');
        if (activeStake) {
          this.masterStakeId = activeStake.id;
          this.validatorId = activeStake.validator_id;
          console.log('Found existing master stake:', {
            stakeId: this.masterStakeId,
            validatorId: this.validatorId
          });
          this.isInitialized = true;
          return;
        }
      }

      // If no active stake found, create new one
      console.log('No active master stake found, creating new one');
      const result = await this.createMasterStake();
      this.isInitialized = true;
      console.log('Created new master stake:', result);
    } catch (error) {
      console.error('Failed to initialize master staking wallet:', error);
      // Don't throw, allow operation in fallback mode
      this.isInitialized = true;
    }
  }

  private async createMasterStake() {
    // Create initial stake with minimum amount (32 ETH)
    const response = await cdpClient.createStake('32000000000000000000', 'eth2');
    this.masterStakeId = response.stake_id;
    this.validatorId = response.validator_id;
    return response;
  }

  async addUserStake(userId: number, amount: string) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('Adding user stake:', { userId, amount });

      // Record the stake in our database
      const [stake] = await db.insert(stakes)
        .values({
          userId,
          amount,
          status: 'pending',
          cdpStakeId: this.masterStakeId,
          cdpValidatorId: this.validatorId,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Record the transaction
      await db.insert(transactions)
        .values({
          userId,
          type: 'stake',
          amount,
          status: 'completed',
          cdpTransactionId: stake.id.toString(),
          createdAt: new Date()
        });

      console.log('User stake recorded:', stake);
      return stake;
    } catch (error) {
      console.error('Failed to add user stake:', error);
      throw error;
    }
  }

  async getNetworkStats() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.validatorId) {
        console.log('No validator ID available, returning null for network stats');
        return null;
      }

      const validator = await cdpClient.getValidator(this.validatorId);
      return {
        totalStaked: validator.total_staked,
        activeValidators: validator.active_validators,
        networkRewards: validator.network_rewards,
        effectiveness: validator.effectiveness
      };
    } catch (error) {
      console.error('Failed to fetch network stats:', error);
      // Return null to allow fallback to mock data
      return null;
    }
  }

  async getStakeInfo() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.masterStakeId) {
        console.log('No master stake ID available');
        return null;
      }

      return await cdpClient.getStake(this.masterStakeId);
    } catch (error) {
      console.error('Failed to get stake info:', error);
      return null;
    }
  }
}

// Export singleton instance
export const masterWallet = MasterStakingWallet.getInstance();