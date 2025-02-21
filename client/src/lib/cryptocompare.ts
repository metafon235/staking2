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
  Response: z.string(),
});

export async function getPIVXPrice(): Promise<number> {
  try {
    console.log("Fetching PIVX price from CryptoCompare...");
    const response = await fetch(
      `${BASE_URL}/price?fsym=PIVX&tsyms=USD`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Apikey ${API_KEY}`
        },
      }
    );

    if (!response.ok) {
      console.error("CryptoCompare API error:", response.status);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    console.log("CryptoCompare response:", data);

    const result = PriceSchema.safeParse(data);

    if (!result.success) {
      console.error("Data validation error:", result.error);
      throw new Error("Invalid data format from API");
    }

    return result.data.PIVX.USD;
  } catch (error) {
    console.error("Failed to fetch PIVX price from CryptoCompare:", error);
    throw error; // Let the component handle the fallback
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
    console.log("Fetching PIVX stats from CryptoCompare...");
    const response = await fetch(
      `${BASE_URL}/v2/histohour?fsym=PIVX&tsym=USD&limit=24`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Apikey ${API_KEY}`
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CryptoCompare API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("CryptoCompare stats response:", data);

    const result = HistoricalDataSchema.safeParse(data);

    if (!result.success) {
      console.error("Data validation error:", result.error);
      throw new Error("Invalid data format from API");
    }

    const prices = result.data.Data;

    if (prices.length === 0) {
      throw new Error("No price data available");
    }

    const lastPrice = prices[prices.length - 1].close;
    const firstPrice = prices[0].close;
    const priceChange = lastPrice - firstPrice;
    const priceChangePercent = (priceChange / firstPrice) * 100;

    const volume24h = prices.reduce((sum, price) => sum + price.volumefrom, 0);
    const highPrice24h = Math.max(...prices.map(p => p.high));
    const lowPrice24h = Math.min(...prices.map(p => p.low));
    const weightedAvgPrice = prices.reduce((sum, price) => sum + price.close, 0) / prices.length;

    return {
      priceChange24h: Number(priceChange.toFixed(4)),
      priceChangePercent24h: Number(priceChangePercent.toFixed(2)),
      volume24h: Number(volume24h.toFixed(2)),
      highPrice24h: Number(highPrice24h.toFixed(4)),
      lowPrice24h: Number(lowPrice24h.toFixed(4)),
      weightedAvgPrice: Number(weightedAvgPrice.toFixed(4)),
    };
  } catch (error) {
    console.error("Failed to fetch PIVX stats from CryptoCompare:", error);
    throw error;
  }
}