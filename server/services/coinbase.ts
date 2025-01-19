import { Client } from '@coinbase/coinbase-sdk';
import type { Account } from '@coinbase/coinbase-sdk';

interface StakingResponse {
  id: string;
  status: string;
  amount: string;
  currency: string;
  transactionId?: string;
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
  private readonly baseUrl = 'https://api.coinbase.com/v2';

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
      const response = await fetch(`${this.baseUrl}/staking/ethereum2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.COINBASE_API_KEY}`,
          'CB-ACCESS-SIGN': this.generateSignature('POST', '/staking/ethereum2', amount),
          'CB-ACCESS-TIMESTAMP': Date.now().toString(),
        },
        body: JSON.stringify({
          amount,
          currency: 'ETH'
        })
      });

      if (!response.ok) {
        throw new Error(`Staking failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.data.id,
        status: data.data.status,
        amount: data.data.amount,
        currency: 'ETH',
        transactionId: data.data.transaction_id
      };
    } catch (error) {
      console.error('Error initiating staking:', error);
      throw new Error('Failed to initiate staking');
    }
  }

  async getStakingRewards(): Promise<RewardsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/staking/ethereum2/rewards`, {
        headers: {
          'Authorization': `Bearer ${process.env.COINBASE_API_KEY}`,
          'CB-ACCESS-SIGN': this.generateSignature('GET', '/staking/ethereum2/rewards', ''),
          'CB-ACCESS-TIMESTAMP': Date.now().toString(),
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch rewards: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        items: data.data.items.map((item: any) => ({
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

  private generateSignature(method: string, path: string, body: string): string {
    const timestamp = Date.now().toString();
    const message = timestamp + method + path + body;
    const signature = require('crypto')
      .createHmac('sha256', process.env.COINBASE_API_SECRET || '')
      .update(message)
      .digest('hex');
    return signature;
  }
}

export const coinbaseService = new CoinbaseService();