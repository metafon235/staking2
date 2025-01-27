import { z } from "zod";

const API_KEY = import.meta.env.VITE_COINMARKETCAP_API_KEY;
const BASE_URL = "https://pro-api.coinmarketcap.com/v2";

const PriceSchema = z.object({
  data: z.object({
    PIVX: z.array(z.object({
      quote: z.object({
        USD: z.object({
          price: z.number(),
          volume_24h: z.number(),
          percent_change_24h: z.number(),
        })
      })
    })).min(1)
  })
});

export async function getPIVXPrice(): Promise<number> {
  try {
    if (!API_KEY) {
      console.error("CoinMarketCap API key is not set");
      throw new Error("API key not configured");
    }

    const response = await fetch(
      `${BASE_URL}/cryptocurrency/quotes/latest?symbol=PIVX`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': API_KEY,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error("CoinMarketCap API error:", response.status);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const result = PriceSchema.safeParse(data);

    if (!result.success) {
      console.error("Data validation error:", result.error);
      throw new Error("Invalid API response format");
    }

    return result.data.data.PIVX[0].quote.USD.price;
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
    if (!API_KEY) {
      throw new Error("API key not configured");
    }

    const response = await fetch(
      `${BASE_URL}/cryptocurrency/quotes/latest?symbol=PIVX`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': API_KEY,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`);
    }

    const data = await response.json();
    const result = PriceSchema.safeParse(data);

    if (!result.success) {
      throw new Error("Invalid data format from API");
    }

    const pivxData = result.data.data.PIVX[0].quote.USD;
    const currentPrice = pivxData.price;
    const priceChangePercent = pivxData.percent_change_24h;
    const priceChange = (currentPrice * priceChangePercent) / 100;

    return {
      priceChange24h: Number(priceChange.toFixed(4)),
      priceChangePercent24h: Number(priceChangePercent.toFixed(2)),
      volume24h: pivxData.volume_24h,
      highPrice24h: currentPrice * (1 + Math.abs(priceChangePercent) / 100),
      lowPrice24h: currentPrice * (1 - Math.abs(priceChangePercent) / 100),
      weightedAvgPrice: currentPrice,
    };
  } catch (error) {
    console.error("Failed to fetch PIVX stats:", error);
    throw error;
  }
}