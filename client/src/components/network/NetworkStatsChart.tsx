import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";

interface NetworkStatsHistory {
  date: number;
  tvl: number;
  validators: number;
  avgStake: number;
  rewards: number;
}

interface NetworkStatsChartProps {
  data: NetworkStatsHistory[];
  symbol: string;
}

export default function NetworkStatsChart({ data, symbol }: NetworkStatsChartProps) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Network Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(value, "MMM d")}
                stroke="#71717a"
                fontSize={12}
              />
              <YAxis 
                yAxisId="tvl"
                orientation="left"
                stroke="#71717a"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="validators"
                orientation="right"
                stroke="#71717a"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "6px",
                }}
                labelStyle={{ color: "#e4e4e7" }}
                labelFormatter={(value) => format(value, "PPP")}
                formatter={(value: number, name) => {
                  switch (name) {
                    case "TVL":
                      return [`${value.toLocaleString()} ${symbol}`, name];
                    case "Validators":
                      return [value.toLocaleString(), name];
                    case "Avg Stake":
                      return [`${value.toFixed(2)} ${symbol}`, name];
                    case "Rewards":
                      return [`${value.toFixed(2)} ${symbol}`, name];
                    default:
                      return [value, name];
                  }
                }}
              />
              <Legend />
              <Line
                yAxisId="tvl"
                type="monotone"
                dataKey="tvl"
                name="TVL"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="validators"
                type="monotone"
                dataKey="validators"
                name="Validators"
                stroke="#ec4899"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="tvl"
                type="monotone"
                dataKey="avgStake"
                name="Avg Stake"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="tvl"
                type="monotone"
                dataKey="rewards"
                name="Rewards"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}