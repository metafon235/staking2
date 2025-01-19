import { z } from "zod";

const BASE_URL = "https://api.binance.com/api/v3";

const PriceSchema = z.object({
  price: z.string(),
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
