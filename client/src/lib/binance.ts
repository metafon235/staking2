import { z } from "zod";

const BASE_URL = "https://api.binance.com/api/v3";

// Update schema to match Binance API response format
const PriceSchema = z.object({
  symbol: z.string(),
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
  try {
    // PIVX/USDT pair is more commonly available than PIVX/EUR
    const response = await fetch(
      `${BASE_URL}/ticker/price?symbol=PIVXUSDT`
    );

    if (!response.ok) {
      console.error(`Binance API error: ${response.status}`);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    console.log("Binance API response:", data); // Debug log

    const result = PriceSchema.safeParse(data);

    if (!result.success) {
      console.error("Data validation error:", result.error);
      throw new Error("Invalid data format from API");
    }

    return parseFloat(result.data.price);
  } catch (error) {
    console.error("Failed to fetch PIVX price:", error);
    throw error; // Let the component handle the error
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
      `${BASE_URL}/ticker/24hr?symbol=PIVXUSDT`
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();
    const result = TickerStatsSchema.safeParse(data);

    if (!result.success) {
      console.error("Data validation error:", result.error);
      throw new Error("Invalid data format from API");
    }

    return {
      priceChange24h: parseFloat(result.data.priceChange),
      priceChangePercent24h: parseFloat(result.data.priceChangePercent),
      volume24h: parseFloat(result.data.volume),
      highPrice24h: parseFloat(result.data.highPrice),
      lowPrice24h: parseFloat(result.data.lowPrice),
      weightedAvgPrice: parseFloat(result.data.weightedAvgPrice),
    };
  } catch (error) {
    console.error("Failed to fetch PIVX stats:", error);
    throw error;
  }
}

export async function getPIVXPriceHistory(days: number = 7): Promise<Array<{ timestamp: number; price: number }>> {
  try {
    const response = await fetch(
      `${BASE_URL}/klines?symbol=PIVXUSDT&interval=1d&limit=${days}`
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();
    return data.map((item: any[]) => ({
      timestamp: item[0], // Open time
      price: parseFloat(item[4]), // Close price
    }));
  } catch (error) {
    console.error("Failed to fetch PIVX price history:", error);
    throw error;
  }
}