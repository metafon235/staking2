import { Client } from '@coinbase/coinbase-sdk';
import type { Account } from '@coinbase/coinbase-sdk';

interface StakingResponse {
  id: string;
  status: string;
  amount: string;
  currency: string;
}

interface RewardsResponse {
  items: Array<{
    id: string;
    amount: string;
    currency: string;
    created_at: string;
  }>;
}

class CoinbaseService {
  private client: Client;

  constructor() {
    this.client = new Client({
      apiKey: process.env.COINBASE_API_KEY || '',
      apiSecret: process.env.COINBASE_API_SECRET || '',
      strictSSL: true
    });
  }

  async getEthereumAccount(): Promise<Account | null> {
    try {
      const accounts = await this.client.getAccounts();
      return accounts.find(account => account.currency === 'ETH') || null;
    } catch (error) {
      console.error('Error fetching Ethereum account:', error);
      throw new Error('Failed to fetch Ethereum account');
    }
  }

  async getEthereumBalance(): Promise<string> {
    try {
      const ethAccount = await this.getEthereumAccount();
      return ethAccount ? ethAccount.balance.amount : '0';
    } catch (error) {
      console.error('Error fetching Ethereum balance:', error);
      throw new Error('Failed to fetch Ethereum balance');
    }
  }

  async initiateStaking(amount: string): Promise<StakingResponse> {
    try {
      // Note: This is a placeholder as Coinbase's public SDK doesn't directly expose staking
      // In a production environment, you would need to implement the actual staking API calls
      const response = await this.client.post('/v2/eth2/staking', {
        amount,
        currency: 'ETH'
      });

      return {
        id: response.data.id,
        status: response.data.status,
        amount: response.data.amount,
        currency: 'ETH'
      };
    } catch (error) {
      console.error('Error initiating staking:', error);
      throw new Error('Failed to initiate staking');
    }
  }

  async getStakingRewards(): Promise<RewardsResponse> {
    try {
      // Note: This is a placeholder as Coinbase's public SDK doesn't directly expose staking rewards
      // In a production environment, you would need to implement the actual rewards API calls
      const response = await this.client.get('/v2/eth2/rewards');

      return {
        items: response.data.items.map((item: any) => ({
          id: item.id,
          amount: item.amount,
          currency: item.currency,
          created_at: item.created_at
        }))
      };
    } catch (error) {
      console.error('Error fetching staking rewards:', error);
      throw new Error('Failed to fetch staking rewards');
    }
  }
}

export const coinbaseService = new CoinbaseService();