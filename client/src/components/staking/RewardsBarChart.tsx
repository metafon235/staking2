import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, startOfDay, endOfDay, subDays, subWeeks, subMonths } from "date-fns";
import { Loader2 } from "lucide-react";

interface Transaction {
  id: number;
  type: string;
  amount: string;
  status: string;
  createdAt: string;
}

interface DailyRewards {
  date: string;
  amount: number;
}

interface RewardsBarChartProps {
  timeRange: 'days' | 'weeks' | 'months';
}

function groupTransactionsByPeriod(transactions: Transaction[], timeRange: 'days' | 'weeks' | 'months'): DailyRewards[] {
  const rewardsMap = new Map<string, number>();
  const now = new Date();

  // Define the start date based on timeRange
  const startDate = {
    days: subDays(now, 7),
    weeks: subWeeks(now, 8),
    months: subMonths(now, 6)
  }[timeRange];

  // Define the format based on timeRange
  const dateFormat = {
    days: 'MMM d',
    weeks: 'MMM d',
    months: 'MMM yyyy'
  }[timeRange];

  // Filter reward transactions and group by period
  transactions
    .filter(tx => tx.type === 'reward' && tx.status === 'completed' && new Date(tx.createdAt) >= startDate)
    .forEach(tx => {
      const day = format(new Date(tx.createdAt), dateFormat);
      const amount = parseFloat(tx.amount);
      rewardsMap.set(day, (rewardsMap.get(day) || 0) + amount);
    });

  // Convert map to array and sort by date
  return Array.from(rewardsMap, ([date, amount]) => ({
    date,
    amount: parseFloat(amount.toFixed(9))
  })).sort((a, b) => a.date.localeCompare(b.date));
}

export default function RewardsBarChart({ timeRange }: RewardsBarChartProps) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-white">Rewards History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const rewardsByPeriod = groupTransactionsByPeriod(transactions || [], timeRange);

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rewardsByPeriod}>
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => value.toFixed(8)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: '6px'
                }}
                labelStyle={{ color: '#e4e4e7' }}
                itemStyle={{ color: '#a855f7' }}
                formatter={(value: number) => [value.toFixed(9) + ' ETH', 'Rewards']}
              />
              <Bar 
                dataKey="amount" 
                fill="#a855f7"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}