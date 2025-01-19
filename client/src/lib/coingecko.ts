import { env } from "@/lib/env";

const BASE_URL = "https://api.coingecko.com/api/v3";

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