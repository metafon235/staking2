import { z } from "zod";

const API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY || '';
const BASE_URL = "https://min-api.cryptocompare.com/data";

const PriceSchema = z.object({
  PIVX: z.object({
    USD: z.number(),
  }),
});

const HistoricalDataSchema = z.object({
  Data: z.array(z.object({
    time: z.number(),
    close: z.number(),
    volumefrom: z.number(),
    volumeto: z.number(),
    high: z.number(),
    low: z.number(),
  })),
});

export async function getPIVXPrice(): Promise<number> {
  try {
    const response = await fetch(
      `${BASE_URL}/price?fsym=PIVX&tsyms=USD&api_key=${API_KEY}`
    );

    if (!response.ok) {
      console.error("CryptoCompare API error:", response.status);
      return 5.23; // Fallback price for demo
    }

    const data = await response.json();
    const result = PriceSchema.parse(data);
    return result.PIVX.USD;
  } catch (error) {
    console.error("Failed to fetch PIVX price:", error);
    return 5.23; // Fallback price for demo
  }
}

export async function getPIVXStats(): Promise<{
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  highPrice24h: number;
  lowPrice24h: number;
  weightedAvgPrice: number;
}> {
  try {
    const response = await fetch(
      `${BASE_URL}/v2/histohour?fsym=PIVX&tsym=USD&limit=24&api_key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`CryptoCompare API error: ${response.status}`);
    }

    const data = await response.json();
    const histData = HistoricalDataSchema.parse(data);
    const prices = histData.Data;

    const lastPrice = prices[prices.length - 1].close;
    const firstPrice = prices[0].close;
    const priceChange = lastPrice - firstPrice;
    const priceChangePercent = (priceChange / firstPrice) * 100;

    const volume24h = prices.reduce((sum, price) => sum + price.volumefrom, 0);
    const highPrice24h = Math.max(...prices.map(p => p.high));
    const lowPrice24h = Math.min(...prices.map(p => p.low));
    const weightedAvgPrice = prices.reduce((sum, price) => sum + price.close, 0) / prices.length;

    return {
      priceChange24h: priceChange,
      priceChangePercent24h: priceChangePercent,
      volume24h,
      highPrice24h,
      lowPrice24h,
      weightedAvgPrice,
    };
  } catch (error) {
    console.error("Failed to fetch PIVX stats:", error);
    // Return demo data as fallback
    return {
      priceChange24h: 0.15,
      priceChangePercent24h: 2.95,
      volume24h: 1250000,
      highPrice24h: 5.45,
      lowPrice24h: 5.12,
      weightedAvgPrice: 5.28,
    };
  }
}
