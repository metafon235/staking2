import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PriceData {
  timestamp: number;
  price: number;
}

interface PriceChartProps {
  symbol: string;
  timeframe?: "24h" | "7d" | "30d" | "1y";
}

export default function PriceChart({ symbol, timeframe = "7d" }: PriceChartProps) {
  const { data: priceData, isLoading } = useQuery({
    queryKey: [`/api/price-history/${symbol}/${timeframe}`],
    enabled: !!symbol,
    refetchInterval: 60000, // Refresh every minute
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(price);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('de-DE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Preisentwicklung</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full bg-zinc-800" />
        ) : priceData ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  dot={false}
                  strokeWidth={2}
                />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatDate}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tickFormatter={formatPrice}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                  labelFormatter={formatDate}
                  formatter={(value: number) => [formatPrice(value), "Preis"]}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-zinc-400 py-4">
            Keine Preisdaten verfügbar
          </p>
        )}
      </CardContent>
    </Card>
  );
}
