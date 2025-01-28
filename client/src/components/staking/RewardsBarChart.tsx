import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, subWeeks, subMonths, getISOWeek, getYear, startOfWeek, endOfWeek } from "date-fns";
import { de } from "date-fns/locale";
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
    weeks: subWeeks(now, 12),
    months: subMonths(now, 6)
  }[timeRange];

  // Filter transactions after start date
  const filteredTransactions = transactions
    .filter(tx => tx.type === 'reward' && 
                tx.status === 'completed' && 
                new Date(tx.createdAt) >= startDate);

  // Group transactions based on the selected time range
  filteredTransactions.forEach(tx => {
    const date = new Date(tx.createdAt);
    let key: string;

    switch (timeRange) {
      case 'days':
        key = format(date, 'dd.MM.');
        break;
      case 'weeks': {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
        const week = getISOWeek(date);
        const year = getYear(date);
        key = `KW ${week} (${format(weekStart, 'dd.MM.')} - ${format(weekEnd, 'dd.MM.')})`;
        break;
      }
      case 'months':
        key = format(date, 'MMM yyyy', { locale: de });
        break;
      default:
        key = format(date, 'dd.MM.');
    }

    const amount = parseFloat(tx.amount);
    rewardsMap.set(key, (rewardsMap.get(key) || 0) + amount);
  });

  return Array.from(rewardsMap, ([date, amount]) => ({
    date,
    amount: parseFloat(amount.toFixed(9))
  })).sort((a, b) => {
    if (timeRange === 'weeks') {
      const weekA = parseInt(a.date.split(' ')[1]);
      const weekB = parseInt(b.date.split(' ')[1]);
      return weekA - weekB;
    }
    return a.date.localeCompare(b.date);
  });
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
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
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
                angle={timeRange === 'weeks' ? -45 : 0}
                textAnchor={timeRange === 'weeks' ? 'end' : 'middle'}
                height={70}
                interval={0}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => value.toFixed(9)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: '6px'
                }}
                labelStyle={{ color: '#e4e4e7' }}
                itemStyle={{ color: '#a855f7' }}
                formatter={(value: number) => [`${value.toFixed(9)} PIVX`, 'Rewards']}
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