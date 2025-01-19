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

export async function getEthPrice(): Promise<number> {
  try {
    const response = await fetch(
      `${BASE_URL}/ticker/price?symbol=ETHUSDT`
    );

    if (!response.ok) {
      console.error("Binance API error:", response.status);
      return 0;
    }

    const data = await response.json();
    const result = PriceSchema.parse(data);
    return parseFloat(result.price);
  } catch (error) {
    console.error("Failed to fetch ETH price:", error);
    return 0;
  }
}

export async function getEthStats(): Promise<{
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  highPrice24h: number;
  lowPrice24h: number;
  weightedAvgPrice: number;
}> {
  try {
    const response = await fetch(
      `${BASE_URL}/ticker/24hr?symbol=ETHUSDT`
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();
    const stats = TickerStatsSchema.parse(data);

    return {
      priceChange24h: parseFloat(stats.priceChange),
      priceChangePercent24h: parseFloat(stats.priceChangePercent),
      volume24h: parseFloat(stats.volume),
      highPrice24h: parseFloat(stats.highPrice),
      lowPrice24h: parseFloat(stats.lowPrice),
      weightedAvgPrice: parseFloat(stats.weightedAvgPrice),
    };
  } catch (error) {
    console.error("Failed to fetch ETH stats:", error);
    return {
      priceChange24h: 0,
      priceChangePercent24h: 0,
      volume24h: 0,
      highPrice24h: 0,
      lowPrice24h: 0,
      weightedAvgPrice: 0,
    };
  }
}

export async function getEthPriceHistory(days: number = 7): Promise<Array<{ timestamp: number; price: number }>> {
  try {
    // Convert days to milliseconds and calculate start time
    const endTime = Date.now();
    const startTime = endTime - (days * 24 * 60 * 60 * 1000);

    const response = await fetch(
      `${BASE_URL}/klines?symbol=ETHUSDT&interval=1h&startTime=${startTime}&endTime=${endTime}`
    );

    if (!response.ok) {
      console.error("Binance API error:", response.status);
      return [];
    }

    const data = await response.json();
    return data.map((candle: any[]) => ({
      timestamp: candle[0], // Open time
      price: parseFloat(candle[4]), // Close price
    }));
  } catch (error) {
    console.error("Failed to fetch ETH price history:", error);
    return [];
  }
}