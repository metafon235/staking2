// Type-safe environment variables
export const env = {
  COINGECKO_API_KEY: import.meta.env.VITE_COINGECKO_API_KEY,
} as const;
