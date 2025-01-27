import { z } from "zod";

const BASE_URL = "https://api.binance.com/api/v3";

const PriceSchema = z.object({
  price: z.string(),
});

const TickerStatsSchema = z.object({
  symbol: z.string(),
  priceChange: z.string(),
  priceChangePercent: z.string(),
  weightedAvgPrice: z.string(),
  prevClosePrice: z.string(),
  lastPrice: z.string(),
  volume: z.string(),
  quoteVolume: z.string(),
  openTime: z.number(),
  closeTime: z.number(),
  highPrice: z.string(),
  lowPrice: z.string(),
});

export async function getPIVXPrice(): Promise<number> {
  // Simulated PIVX price for demo purposes
  return 5.23;
}

export async function getPIVXStats(): Promise<{
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  highPrice24h: number;
  lowPrice24h: number;
  weightedAvgPrice: number;
}> {
  // Simulated PIVX stats for demo purposes
  return {
    priceChange24h: 0.15,
    priceChangePercent24h: 2.95,
    volume24h: 1250000,
    highPrice24h: 5.45,
    lowPrice24h: 5.12,
    weightedAvgPrice: 5.28,
  };
}

export async function getPIVXPriceHistory(days: number = 7): Promise<Array<{ timestamp: number; price: number }>> {
  // Simulated PIVX price history for demo purposes
  const now = Date.now();
  const history = [];
  for (let i = days; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    const basePrice = 5.23;
    const randomVariation = (Math.random() - 0.5) * 0.2;
    history.push({
      timestamp,
      price: basePrice + randomVariation,
    });
  }
  return history;
}