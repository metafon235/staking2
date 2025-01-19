import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";

interface StakingChartProps {
  data: Array<{
    timestamp: number;
    rewards: number;
  }>;
  totalStaked: number;
  currentRewards: number;
}

type TimeRange = 'hour' | 'day' | 'week';

export default function StakingChart({ data, totalStaked, currentRewards }: StakingChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('hour');

  const getTimeFormat = (range: TimeRange) => {
    switch (range) {
      case 'hour':
        return 'HH:mm';
      case 'day':
        return 'MMM dd HH:mm';
      case 'week':
        return 'MMM dd';
      default:
        return 'HH:mm';
    }
  };

  const filterDataByTimeRange = (range: TimeRange) => {
    const now = Date.now();
    const ranges = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000
    };

    return data.filter(point => point.timestamp >= now - ranges[range]);
  };

  const formattedData = filterDataByTimeRange(timeRange).map(point => ({
    ...point,
    time: format(new Date(point.timestamp), getTimeFormat(timeRange)),
    rewards: point.rewards.toFixed(9)
  }));

  return (
    <Card className="col-span-3 bg-zinc-900 border-zinc-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg text-white">Staking Rewards History</CardTitle>
            <CardDescription className="text-zinc-400">
              Real-time rewards accumulation for {totalStaked.toFixed(9)} ETH staked
            </CardDescription>
          </div>
          <ToggleGroup 
            type="single" 
            value={timeRange}
            onValueChange={(value: TimeRange) => value && setTimeRange(value)}
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
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="rewardsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                tickFormatter={value => Number(value).toFixed(9)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "6px",
                }}
                labelStyle={{ color: "#e4e4e7" }}
                itemStyle={{ color: "#a78bfa" }}
                formatter={(value: string) => [`${Number(value).toFixed(9)}`, "ETH"]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="rewards"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#rewardsGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-sm text-zinc-400">Current Rewards</p>
            <p className="text-lg font-semibold text-white">{currentRewards.toFixed(9)} ETH</p>
          </div>
          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-sm text-zinc-400">Total Staked</p>
            <p className="text-lg font-semibold text-white">{totalStaked.toFixed(9)} ETH</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}