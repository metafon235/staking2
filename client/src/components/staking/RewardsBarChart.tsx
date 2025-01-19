import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
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

function groupTransactionsByDay(transactions: Transaction[]): DailyRewards[] {
  const rewardsMap = new Map<string, number>();

  // Filter reward transactions and group by day
  transactions
    .filter(tx => tx.type === 'reward' && tx.status === 'completed')
    .forEach(tx => {
      const day = format(new Date(tx.createdAt), 'MMM d');
      const amount = parseFloat(tx.amount);
      rewardsMap.set(day, (rewardsMap.get(day) || 0) + amount);
    });

  // Convert map to array and sort by date
  return Array.from(rewardsMap, ([date, amount]) => ({
    date,
    amount: parseFloat(amount.toFixed(9))
  })).sort((a, b) => a.date.localeCompare(b.date));
}

export default function RewardsBarChart() {
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
      <Card className="bg-[#474056]/10 border-[#757083]">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-white">Daily Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-[#77F311]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const dailyRewards = groupTransactionsByDay(transactions || []);

  return (
    <Card className="bg-[#474056]/10 border-[#757083]">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-white">Daily Rewards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyRewards}>
              <XAxis 
                dataKey="date" 
                stroke="#8A95A5"
                fontSize={12}
              />
              <YAxis 
                stroke="#8A95A5"
                fontSize={12}
                tickFormatter={(value) => value.toFixed(8)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#474056',
                  border: '1px solid #757083',
                  borderRadius: '6px'
                }}
                labelStyle={{ color: '#FFFFFF' }}
                itemStyle={{ color: '#77F311' }}
                formatter={(value: number) => [value.toFixed(9) + ' ETH', 'Rewards']}
              />
              <Bar 
                dataKey="amount" 
                fill="#77F311"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}