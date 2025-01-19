import { env } from "@/lib/env";

const BASE_URL = "https://api.coingecko.com/api/v3";

export interface CoinGeckoPrice {
  ethereum: {
    usd: number;
  };
}

export async function getEthPrice(): Promise<number> {
  try {
    const response = await fetch(
      `${BASE_URL}/simple/price?ids=ethereum&vs_currencies=usd`,
      {
        headers: {
          "x-cg-api-key": env.COINGECKO_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      console.error("CoinGecko API error:", response.status, await response.text());
      return 0;
    }

    const data: CoinGeckoPrice = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    console.error("Failed to fetch ETH price:", error);
    return 0;
  }
}

export async function getEthPriceHistory(days: number = 7): Promise<Array<{ timestamp: number; price: number }>> {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/ethereum/market_chart?vs_currency=usd&days=${days}&interval=hourly`,
      {
        headers: {
          "x-cg-api-key": env.COINGECKO_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      console.error("CoinGecko API error:", response.status, await response.text());
      return [];
    }

    const data = await response.json();
    return data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
    }));
  } catch (error) {
    console.error("Failed to fetch ETH price history:", error);
    return [];
  }
}