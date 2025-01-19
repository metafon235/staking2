// Type-safe environment variables
export const env = {
  COINGECKO_API_KEY: import.meta.env.VITE_COINGECKO_API_KEY || '',
} as const;

// Verify API key presence on startup
if (!env.COINGECKO_API_KEY) {
  console.warn('VITE_COINGECKO_API_KEY is not set. CoinGecko API calls may fail.');
}