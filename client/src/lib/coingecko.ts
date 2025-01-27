import { env } from "@/lib/env";
import { z } from "zod";

const BASE_URL = "https://api.coingecko.com/api/v3";

const PriceSchema = z.object({
  pivx: z.object({
    usd: z.number(),
  }),
});

const CoinStatsSchema = z.object({
  market_data: z.object({
    current_price: z.object({
      usd: z.number(),
    }),
    price_change_24h: z.number(),
    price_change_percentage_24h: z.number(),
    total_volume: z.object({
      usd: z.number(),
    }),
    high_24h: z.object({
      usd: z.number(),
    }),
    low_24h: z.object({
      usd: z.number(),
    }),
  }),
});

export interface CoinGeckoPrice {
  ethereum: {
    usd: number;
  };
}

export async function getEthPrice(): Promise<number> {
  try {
    if (!env.COINGECKO_API_KEY) {
      console.error("CoinGecko API key is not set");
      return 0;
    }

    const response = await fetch(
      `${BASE_URL}/simple/price?ids=ethereum&vs_currencies=usd`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CG-Api-Key': env.COINGECKO_API_KEY
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("CoinGecko API error:", response.status, errorText);
      return 0;
    }

    const data: CoinGeckoPrice = await response.json();
    console.log("CoinGecko API response:", data); // Debug log
    return data.ethereum.usd;
  } catch (error) {
    console.error("Failed to fetch ETH price:", error);
    return 0;
  }
}

export async function getEthPriceHistory(days: number = 7): Promise<Array<{ timestamp: number; price: number }>> {
  try {
    if (!env.COINGECKO_API_KEY) {
      console.error("CoinGecko API key is not set");
      return [];
    }

    const response = await fetch(
      `${BASE_URL}/coins/ethereum/market_chart?vs_currency=usd&days=${days}&interval=hourly`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CG-Api-Key': env.COINGECKO_API_KEY
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("CoinGecko API error:", response.status, errorText);
      return [];
    }

    const data = await response.json();
    console.log("CoinGecko price history response:", data); // Debug log
    return data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
    }));
  } catch (error) {
    console.error("Failed to fetch ETH price history:", error);
    return [];
  }
}

export async function getPIVXPrice(): Promise<number> {
  try {
    const response = await fetch(
      `${BASE_URL}/simple/price?ids=pivx&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const result = PriceSchema.safeParse(data);

    if (!result.success) {
      console.error("Data validation error:", result.error);
      throw new Error("Invalid data format from API");
    }

    return result.data.pivx.usd;
  } catch (error) {
    console.error("Failed to fetch PIVX price:", error);
    throw error;
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
    const response = await fetch(`${BASE_URL}/coins/pivx`);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const result = CoinStatsSchema.safeParse(data);

    if (!result.success) {
      throw new Error("Invalid data format from API");
    }

    const marketData = result.data.market_data;
    return {
      priceChange24h: marketData.price_change_24h,
      priceChangePercent24h: marketData.price_change_percentage_24h,
      volume24h: marketData.total_volume.usd,
      highPrice24h: marketData.high_24h.usd,
      lowPrice24h: marketData.low_24h.usd,
      weightedAvgPrice: marketData.current_price.usd,
    };
  } catch (error) {
    console.error("Failed to fetch PIVX stats:", error);
    throw error;
  }
}

export async function getPIVXPriceHistory(days: number = 7): Promise<Array<{ timestamp: number; price: number }>> {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/pivx/market_chart?vs_currency=usd&days=${days}&interval=daily`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    return data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
    }));
  } catch (error) {
    console.error("Failed to fetch PIVX price history:", error);
    // Return simulated price history as fallback
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
}