import { CloudClient, Environment } from '@coinbase/cloud-http-client';
import { cdpConfig } from '../../../config/cdp.config';

class CDPService {
  private client: CloudClient;

  constructor() {
    this.client = new CloudClient({
      apiKey: cdpConfig.apiKey,
      apiSecret: cdpConfig.apiSecret,
      environment: cdpConfig.environment,
    });
  }

  /**
   * Initialize staking for a user
   */
  async initiateStaking(userId: string, amount: string, protocol: string = 'eth2') {
    try {
      const response = await this.client.post('/staking/v1/stakes', {
        protocol,
        amount,
        userId
      });
      
      return response.data;
    } catch (error) {
      console.error('CDP Staking Error:', error);
      throw new Error('Failed to initiate staking');
    }
  }

  /**
   * Get staking information for a user
   */
  async getStakingInfo(userId: string) {
    try {
      const response = await this.client.get(`/staking/v1/stakes/${userId}`);
      return response.data;
    } catch (error) {
      console.error('CDP Get Staking Info Error:', error);
      throw new Error('Failed to fetch staking information');
    }
  }

  /**
   * Get rewards information for a stake
   */
  async getRewards(stakeId: string) {
    try {
      const response = await this.client.get(`/staking/v1/rewards/${stakeId}`);
      return response.data;
    } catch (error) {
      console.error('CDP Get Rewards Error:', error);
      throw new Error('Failed to fetch rewards information');
    }
  }
}

// Export singleton instance
export const cdpService = new CDPService();
