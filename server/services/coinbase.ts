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
  private readonly baseUrl = 'https://api-public.sandbox.exchange.coinbase.com';
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor() {
    this.apiKey = process.env.COINBASE_API_KEY || '';
    this.apiSecret = process.env.COINBASE_API_SECRET || '';

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Coinbase API credentials are not configured');
    }

    console.log('CoinbaseService initialized with sandbox API key:', this.apiKey.substring(0, 4) + '...');
  }

  async getEthereumBalance(): Promise<string> {
    try {
      const path = '/api/v3/brokerage/accounts';
      console.log('Fetching ETH balance from sandbox:', `${this.baseUrl}${path}`);

      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: this.getHeaders('GET', path),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Coinbase Sandbox API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          headers: response.headers,
        });
        throw new Error(`Failed to fetch Ethereum balance: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Sandbox balance response:', data);

      // Find ETH account in the list
      const ethAccount = data.accounts.find((acc: any) => acc.currency === 'ETH');
      return ethAccount ? ethAccount.available_balance.value : '0';
    } catch (error) {
      console.error('Error fetching Ethereum balance from sandbox:', error);
      throw error;
    }
  }

  async initiateStaking(amount: string): Promise<StakingResponse> {
    try {
      const path = '/api/v3/brokerage/staking/ethereum2/stake';
      const body = JSON.stringify({
        amount,
        currency: 'ETH',
      });

      console.log('Initiating sandbox staking request:', {
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
        console.error('Sandbox Staking API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorResponse,
          headers: response.headers,
        });
        throw new Error(errorResponse.message || 'Staking failed');
      }

      const data = await response.json();
      console.log('Sandbox staking response:', data);

      return {
        id: data.stake_id,
        status: data.status,
        amount: amount,
        currency: 'ETH',
        transactionId: data.transaction_id
      };
    } catch (error) {
      console.error('Error initiating staking in sandbox:', error);
      throw error;
    }
  }

  async getStakingRewards(): Promise<RewardsResponse> {
    try {
      const path = '/api/v3/brokerage/staking/ethereum2/rewards';
      console.log('Fetching staking rewards from sandbox:', `${this.baseUrl}${path}`);

      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: this.getHeaders('GET', path),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sandbox Rewards API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          headers: response.headers,
        });
        throw new Error('Failed to fetch rewards');
      }

      const data = await response.json();
      console.log('Sandbox rewards response:', data);

      return {
        items: data.rewards.map((item: any) => ({
          id: item.id,
          amount: item.amount,
          currency: 'ETH',
          created_at: item.created_at
        }))
      };
    } catch (error) {
      console.error('Error fetching staking rewards from sandbox:', error);
      throw error;
    }
  }

  private getHeaders(method: string, path: string, body: string = ''): HeadersInit {
    const timestamp = Date.now() / 1000;
    const message = `${timestamp}${method}${path}${body}`;
    const signature = createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('base64');

    return {
      'Content-Type': 'application/json',
      'CB-ACCESS-KEY': this.apiKey,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp.toString(),
      'CB-ACCESS-PASSPHRASE': process.env.COINBASE_SANDBOX_PASSPHRASE || '',
    };
  }
}

export const coinbaseService = new CoinbaseService();