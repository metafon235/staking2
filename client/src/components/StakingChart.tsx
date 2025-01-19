import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface StakingChartProps {
  data: Array<{
    timestamp: number;
    rewards: number;
  }>;
  totalStaked: number;
  currentRewards: number;
}

export default function StakingChart({ data, totalStaked, currentRewards }: StakingChartProps) {
  const formattedData = data.map(point => ({
    ...point,
    time: format(new Date(point.timestamp), 'HH:mm'),
    rewards: point.rewards.toFixed(8)
  }));

  return (
    <Card className="col-span-3 bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-lg text-white">Staking Rewards History</CardTitle>
        <CardDescription className="text-zinc-400">
          Real-time rewards accumulation for {totalStaked} ETH staked
        </CardDescription>
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
                tickFormatter={value => Number(value).toFixed(8)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "6px",
                }}
                labelStyle={{ color: "#e4e4e7" }}
                itemStyle={{ color: "#a78bfa" }}
                formatter={(value: string) => [Number(value).toFixed(8), "ETH"]}
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
            <p className="text-lg font-semibold text-white">{currentRewards.toFixed(8)} ETH</p>
          </div>
          <div className="bg-zinc-800 p-4 rounded-lg">
            <p className="text-sm text-zinc-400">Total Staked</p>
            <p className="text-lg font-semibold text-white">{totalStaked.toFixed(8)} ETH</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
