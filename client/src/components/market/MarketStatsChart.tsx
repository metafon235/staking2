import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketStatsProps {
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  highPrice24h: number;
  lowPrice24h: number;
  weightedAvgPrice: number;
}

export default function MarketStatsChart({
  priceChange24h,
  priceChangePercent24h,
  volume24h,
  highPrice24h,
  lowPrice24h,
  weightedAvgPrice,
}: MarketStatsProps) {
  // Mock data points for 24h chart
  const generatePriceData = () => {
    const data = [];
    const now = Date.now();
    const hourInMs = 3600000;
    
    for (let i = 24; i >= 0; i--) {
      const timestamp = now - (i * hourInMs);
      const basePrice = weightedAvgPrice;
      const variance = (Math.random() - 0.5) * Math.abs(priceChange24h) * 0.5;
      const price = basePrice + variance;
      
      data.push({
        timestamp,
        price,
        volume: (volume24h / 24) * (0.8 + Math.random() * 0.4), // Distribute volume over 24h with some randomness
      });
    }
    return data;
  };

  const marketData = generatePriceData();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Price Movement (24h)</CardTitle>
            <div className={`flex items-center ${priceChangePercent24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChangePercent24h >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span>{priceChangePercent24h.toFixed(2)}%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketData}>
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => format(value, "HH:mm")}
                  stroke="#71717a"
                  fontSize={12}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  stroke="#71717a"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "#e4e4e7" }}
                  labelFormatter={(value) => format(value, "HH:mm")}
                  formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, "Price"]}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-zinc-400">24h High</span>
              <p className="text-white font-medium">${highPrice24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <span className="text-zinc-400">24h Low</span>
              <p className="text-white font-medium">${lowPrice24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Trading Volume (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marketData}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => format(value, "HH:mm")}
                  stroke="#71717a"
                  fontSize={12}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "#e4e4e7" }}
                  labelFormatter={(value) => format(value, "HH:mm")}
                  formatter={(value: number) => [
                    `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETH`,
                    "Volume"
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#8b5cf6"
                  fill="url(#volumeGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-zinc-400">Total Volume</span>
              <p className="text-white font-medium">
                {volume24h.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETH
              </p>
            </div>
            <div>
              <span className="text-zinc-400">Avg Price</span>
              <p className="text-white font-medium">
                ${weightedAvgPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
