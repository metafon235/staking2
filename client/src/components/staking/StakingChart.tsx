import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { memo, useState, useMemo, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface StakingChartProps {
  data: Array<{
    timestamp: number;
    rewards: number;
  }>;
  totalStaked: number;
  currentRewards: number;
  isLoading?: boolean;
}

// Optimierte Chart-Komponente mit Memoization
function StakingChartComponent({ data, totalStaked, currentRewards, isLoading }: StakingChartProps) {
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week'>('hour');

  // Memoized Zeitformat-Funktion
  const getTimeFormat = useCallback((range: 'hour' | 'day' | 'week') => {
    switch (range) {
      case 'hour': return 'HH:mm:ss';
      case 'day': return 'MMM dd HH:mm';
      case 'week': return 'MMM dd';
    }
  }, []);

  // Memoized Datenformatierung
  const formattedData = useMemo(() => {
    if (!data?.length) return [];

    const now = Date.now();
    const ranges = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000
    };

    const timeWindow = ranges[timeRange];
    const startTime = now - timeWindow;

    return data
      .filter(point => point.timestamp >= startTime && point.timestamp <= now)
      .map(point => ({
        ...point,
        time: format(point.timestamp, getTimeFormat(timeRange)),
        rewards: Number(point.rewards)
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [data, timeRange, getTimeFormat]);

  // Memoized Y-Achsen Domain für bessere Performance
  const yAxisDomain = useMemo(() => {
    if (!formattedData.length) return [0, 0];
    const values = formattedData.map(d => d.rewards);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [formattedData]);

  if (isLoading) {
    return (
      <Card className="col-span-3 bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-6 w-48 bg-zinc-800" />
              <Skeleton className="h-4 w-64 mt-2 bg-zinc-800" />
            </div>
            <Skeleton className="h-8 w-32 bg-zinc-800" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full mt-4 bg-zinc-800" />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Skeleton className="h-20 bg-zinc-800" />
            <Skeleton className="h-20 bg-zinc-800" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Memoized Gradient Definition
  const gradientDef = useMemo(() => (
    <defs>
      <linearGradient id="rewardsGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
      </linearGradient>
    </defs>
  ), []);

  return (
    <Card className="col-span-3 bg-zinc-900 border-zinc-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg text-white">Staking Rewards History</CardTitle>
            <CardDescription className="text-zinc-400">
              Real-time rewards accumulation for {totalStaked.toFixed(6)} ETH staked
            </CardDescription>
          </div>
          <ToggleGroup 
            type="single" 
            value={timeRange}
            onValueChange={(value: 'hour' | 'day' | 'week') => value && setTimeRange(value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg"
          >
            <ToggleGroupItem 
              value="hour" 
              className="text-sm data-[state=on]:bg-purple-600 data-[state=on]:text-white"
            >
              1H
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="day" 
              className="text-sm data-[state=on]:bg-purple-600 data-[state=on]:text-white"
            >
              24H
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="week" 
              className="text-sm data-[state=on]:bg-purple-600 data-[state=on]:text-white"
            >
              7D
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          {formattedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={formattedData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                {gradientDef}
                <XAxis
                  dataKey="time"
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={value => value.toFixed(9)}
                  domain={yAxisDomain}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "#e4e4e7" }}
                  itemStyle={{ color: "#a78bfa" }}
                  formatter={(value: number) => [value.toFixed(9), "ETH"]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="rewards"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#rewardsGradient)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-400">
              No reward data available for the selected time range
            </div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-sm text-zinc-400">Current Rewards</p>
            <p className="text-lg font-semibold text-white">{currentRewards.toFixed(9)} ETH</p>
          </div>
          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-sm text-zinc-400">Total Staked</p>
            <p className="text-lg font-semibold text-white">{totalStaked.toFixed(6)} ETH</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Exportiere memoized Komponente
export default memo(StakingChartComponent);