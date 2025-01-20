export interface CDPConfig {
  apiKey: string;
  apiSecret: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
}

export const cdpConfig: CDPConfig = {
  apiKey: process.env.CDP_API_KEY || '',
  apiSecret: process.env.CDP_API_SECRET || '',
  webhookSecret: process.env.CDP_WEBHOOK_SECRET || '',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
};

// Validation
if (!cdpConfig.apiKey || !cdpConfig.apiSecret) {
  throw new Error('CDP API credentials are required. Please set CDP_API_KEY and CDP_API_SECRET environment variables.');
}

if (!cdpConfig.webhookSecret) {
  throw new Error('CDP webhook secret is required. Please set CDP_WEBHOOK_SECRET environment variable.');
}