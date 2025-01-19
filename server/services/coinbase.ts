import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { createHmac } from 'crypto';

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
  private readonly baseUrl = 'https://api.coinbase.com';
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor() {
    this.apiKey = process.env.COINBASE_API_KEY || '';
    this.apiSecret = process.env.COINBASE_API_SECRET || '';

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Coinbase API credentials are not configured');
    }

    console.log('CoinbaseService initialized with API key:', this.apiKey.substring(0, 4) + '...');
  }

  async getEthereumBalance(): Promise<string> {
    try {
      const path = '/v2/accounts/ETH2';
      console.log('Fetching ETH balance from:', `${this.baseUrl}${path}`);

      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: this.getHeaders('GET', path),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Coinbase API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          headers: response.headers,
        });
        throw new Error(`Failed to fetch Ethereum balance: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Balance response:', data);
      return data.data.balance.amount;
    } catch (error) {
      console.error('Error fetching Ethereum balance:', error);
      throw error;
    }
  }

  async initiateStaking(amount: string): Promise<StakingResponse> {
    try {
      const path = '/v2/eth2/staking/stake';
      const body = JSON.stringify({
        amount,
        currency: 'ETH',
        staking_period: 'flexible'
      });

      console.log('Initiating staking request:', {
        url: `${this.baseUrl}${path}`,
        amount,
        headers: this.getHeaders('POST', path, body)
      });

      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: this.getHeaders('POST', path, body),
        body
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Staking API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorResponse,
          headers: response.headers,
        });
        throw new Error(errorResponse.message || 'Staking failed');
      }

      const data = await response.json();
      console.log('Staking response:', data);

      return {
        id: data.data.id,
        status: data.data.status,
        amount: data.data.amount,
        currency: 'ETH',
        transactionId: data.data.transaction_id
      };
    } catch (error) {
      console.error('Error initiating staking:', error);
      throw error;
    }
  }

  async getStakingRewards(): Promise<RewardsResponse> {
    try {
      const path = '/v2/eth2/staking/rewards';
      console.log('Fetching staking rewards from:', `${this.baseUrl}${path}`);

      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: this.getHeaders('GET', path),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Rewards API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          headers: response.headers,
        });
        throw new Error('Failed to fetch rewards');
      }

      const data = await response.json();
      console.log('Rewards response:', data);

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
      throw error;
    }
  }

  private getHeaders(method: string, path: string, body: string = ''): HeadersInit {
    const timestamp = Date.now().toString();
    const message = timestamp + method + path + body;
    const signature = createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');

    return {
      'Content-Type': 'application/json',
      'CB-ACCESS-KEY': this.apiKey,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'CB-VERSION': '2021-11-01'
    };
  }
}

export const coinbaseService = new CoinbaseService();