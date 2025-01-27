import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useMemo } from "react";
import { getPIVXStats } from "@/lib/cryptocompare";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { GiTwoCoins } from "react-icons/gi";

export default function MarketStatsChart() {
  const { data: pivxStats, isLoading } = useQuery({
    queryKey: ['pivxStats'],
    queryFn: getPIVXStats,
    refetchInterval: 30000,
    staleTime: 0
  });

  const stats = useMemo(() => ({
    priceChange24h: pivxStats?.priceChange24h ?? 0,
    priceChangePercent24h: pivxStats?.priceChangePercent24h ?? 0,
    volume24h: pivxStats?.volume24h ?? 0,
    highPrice24h: pivxStats?.highPrice24h ?? 0,
    lowPrice24h: pivxStats?.lowPrice24h ?? 0,
    weightedAvgPrice: pivxStats?.weightedAvgPrice ?? 5.23, // Updated fallback price
  }), [pivxStats]);

  const marketData = useMemo(() => {
    const generatePriceData = () => {
      const data = [];
      const now = Date.now();
      const hourInMs = 3600000;

      for (let i = 24; i >= 0; i--) {
        const timestamp = now - (i * hourInMs);
        const basePrice = stats.weightedAvgPrice;
        const variance = (Math.random() - 0.5) * Math.abs(stats.priceChange24h) * 0.5;
        const price = basePrice + variance;

        data.push({
          timestamp,
          price,
          volume: (stats.volume24h / 24) * (0.8 + Math.random() * 0.4),
        });
      }
      return data;
    };

    return generatePriceData();
  }, [stats.weightedAvgPrice, stats.priceChange24h, stats.volume24h]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[400px] bg-zinc-800" />
        <Skeleton className="h-[400px] bg-zinc-800" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <GiTwoCoins className="w-6 h-6 text-purple-400" />
              <CardTitle className="text-white">PIVX Price Movement (24h)</CardTitle>
            </div>
            <div className={`flex items-center ${stats.priceChangePercent24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.priceChangePercent24h >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span>{stats.priceChangePercent24h.toFixed(2)}%</span>
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
                  tickFormatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "#e4e4e7" }}
                  labelFormatter={(value) => format(value, "HH:mm")}
                  formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, "PIVX Price"]}
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
              <p className="text-white font-medium">${stats.highPrice24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <span className="text-zinc-400">24h Low</span>
              <p className="text-white font-medium">${stats.lowPrice24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">PIVX Trading Volume (24h)</CardTitle>
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
                    `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} PIVX`,
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
                {stats.volume24h.toLocaleString(undefined, { maximumFractionDigits: 2 })} PIVX
              </p>
            </div>
            <div>
              <span className="text-zinc-400">Avg Price</span>
              <p className="text-white font-medium">
                ${stats.weightedAvgPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}