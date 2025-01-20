import { Environment } from '@coinbase/cloud-http-client';

export interface CDPConfig {
  apiKey: string;
  apiSecret: string;
  environment: Environment;
  webhookSecret: string;
}

export const cdpConfig: CDPConfig = {
  apiKey: process.env.CDP_API_KEY || '',
  apiSecret: process.env.CDP_API_SECRET || '',
  environment: (process.env.NODE_ENV === 'production' ? Environment.PRODUCTION : Environment.SANDBOX) as Environment,
  webhookSecret: process.env.CDP_WEBHOOK_SECRET || ''
};

// Validation
if (!cdpConfig.apiKey || !cdpConfig.apiSecret) {
  throw new Error('CDP API credentials are required. Please set CDP_API_KEY and CDP_API_SECRET environment variables.');
}
