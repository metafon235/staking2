import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import type { Account } from '@coinbase/wallet-sdk';

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
  private readonly baseUrl = 'https://api.cdp.coinbase.com';
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor() {
    this.apiKey = process.env.COINBASE_API_KEY || '';
    this.apiSecret = process.env.COINBASE_API_SECRET || '';

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Coinbase API credentials are not configured');
    }
  }

  async getEthereumBalance(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/accounts/ETH`, {
        headers: this.getHeaders('GET', '/v2/accounts/ETH'),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Ethereum balance');
      }

      const data = await response.json();
      return data.data.balance.amount;
    } catch (error) {
      console.error('Error fetching Ethereum balance:', error);
      throw new Error('Failed to fetch Ethereum balance');
    }
  }

  async initiateStaking(amount: string): Promise<StakingResponse> {
    try {
      const path = '/v2/eth2/staking';
      const body = JSON.stringify({
        amount,
        currency: 'ETH'
      });

      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: this.getHeaders('POST', path, body),
        body
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Staking failed');
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
      const path = '/v2/eth2/rewards';
      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: this.getHeaders('GET', path),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rewards');
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

  private getHeaders(method: string, path: string, body: string = ''): HeadersInit {
    const timestamp = Date.now().toString();
    const message = timestamp + method + path + body;
    const signature = require('crypto')
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');

    return {
      'Content-Type': 'application/json',
      'CB-ACCESS-KEY': this.apiKey,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
    };
  }
}

export const coinbaseService = new CoinbaseService();