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
      return 5.23; // Fallback price
    }

    const data = await response.json();
    const result = PriceSchema.safeParse(data);

    if (!result.success) {
      console.error("Data validation error:", result.error);
      return 5.23;
    }

    return result.data.data.PIVX[0].quote.USD.price;
  } catch (error) {
    console.error("Failed to fetch PIVX price:", error);
    return 5.23;
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
      priceChange24h: priceChange,
      priceChangePercent24h: priceChangePercent,
      volume24h: pivxData.volume_24h,
      highPrice24h: currentPrice * (1 + Math.abs(priceChangePercent) / 100),
      lowPrice24h: currentPrice * (1 - Math.abs(priceChangePercent) / 100),
      weightedAvgPrice: currentPrice,
    };
  } catch (error) {
    console.error("Failed to fetch PIVX stats:", error);
    return {
      priceChange24h: 0.15,
      priceChangePercent24h: 2.95,
      volume24h: 125000,
      highPrice24h: 5.45,
      lowPrice24h: 5.12,
      weightedAvgPrice: 5.28,
    };
  }
}
