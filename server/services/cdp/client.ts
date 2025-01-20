import axios, { type AxiosInstance, AxiosError } from 'axios';
import crypto from 'crypto';

interface CDPConfig {
  apiKey: string;
  apiSecret: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
}

interface CDPError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

class CDPClient {
  private readonly client: AxiosInstance;
  private readonly config: CDPConfig;

  constructor(config: CDPConfig) {
    this.config = config;

    const baseURL = config.environment === 'production' 
      ? 'https://api.coinbase.com/v2/cloud/staking'
      : 'https://api-sandbox.coinbase.com/v2/cloud/staking';

    this.client = axios.create({
      baseURL,
      headers: {
        'CB-ACCESS-KEY': config.apiKey,
        'Content-Type': 'application/json',
      }
    });

    // Add request interceptor to sign requests
    this.client.interceptors.request.use((config) => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const method = config.method?.toUpperCase() || 'GET';
      const path = config.url || '';
      const body = config.data ? JSON.stringify(config.data) : '';

      const signature = this.sign(`${timestamp}${method}${path}${body}`);

      config.headers['CB-ACCESS-SIGN'] = signature;
      config.headers['CB-ACCESS-TIMESTAMP'] = timestamp;

      return config;
    });
  }

  private sign(message: string): string {
    return crypto
      .createHmac('sha256', this.config.apiSecret)
      .update(message)
      .digest('hex');
  }

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<CDPError>;
      const response = axiosError.response;

      console.error('CDP API Error:', {
        status: response?.status,
        data: response?.data,
        headers: response?.headers,
        config: {
          method: axiosError.config?.method,
          url: axiosError.config?.url,
          headers: axiosError.config?.headers,
        }
      });

      if (response?.data) {
        throw new Error(`CDP API Error: ${response.data.message}`);
      }

      throw new Error(`CDP API Error: ${axiosError.message}`);
    }

    console.error('Unexpected CDP Error:', error);
    throw error;
  }

  // Staking Operations
  async createStake(amount: string, protocol: string = 'eth2') {
    try {
      console.log('Creating CDP stake:', { amount, protocol });
      const response = await this.client.post('/stakes', {
        protocol,
        amount
      });
      console.log('CDP stake created:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getStake(stakeId: string) {
    try {
      console.log('Fetching CDP stake:', { stakeId });
      const response = await this.client.get(`/stakes/${stakeId}`);
      console.log('CDP stake fetched:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async listStakes(userId?: string) {
    try {
      console.log('Listing CDP stakes:', { userId });
      const params = userId ? { user_id: userId } : undefined;
      const response = await this.client.get('/stakes', { params });
      console.log('CDP stakes listed:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Rewards Operations
  async getRewards(stakeId: string) {
    try {
      console.log('Fetching CDP rewards:', { stakeId });
      const response = await this.client.get(`/rewards/${stakeId}`);
      console.log('CDP rewards fetched:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Validator Operations
  async getValidator(validatorId: string) {
    try {
      console.log('Fetching CDP validator:', { validatorId });
      const response = await this.client.get(`/validators/${validatorId}`);
      console.log('CDP validator fetched:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Webhook signature verification
  verifyWebhookSignature(signature: string, payload: string): boolean {
    console.log('Verifying CDP webhook signature');
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(payload)
        .digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

      console.log('CDP webhook signature verification:', { 
        isValid,
        payloadLength: payload.length,
        signatureLength: signature.length
      });

      return isValid;
    } catch (error) {
      console.error('CDP webhook signature verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance with config from environment
export const cdpClient = new CDPClient({
  apiKey: process.env.CDP_API_KEY || '',
  apiSecret: process.env.CDP_API_SECRET || '',
  webhookSecret: process.env.CDP_WEBHOOK_SECRET || '',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
});