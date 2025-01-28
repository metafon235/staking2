import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Transaction {
  id: number;
  type: 'stake' | 'withdraw' | 'claim' | 'reward';
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  transactionHash?: string;
}

async function fetchTransactionHistory(): Promise<Transaction[]> {
  const response = await fetch('/api/transactions');
  if (!response.ok) {
    throw new Error('Failed to fetch transaction history');
  }
  return response.json();
}

export default function TransactionHistory() {
  const [visibleTransactions, setVisibleTransactions] = useState(50);
  const [activeTab, setActiveTab] = useState("table");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: fetchTransactionHistory,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-zinc-400';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'stake':
        return 'Stake';
      case 'withdraw':
        return 'Withdraw';
      case 'claim':
        return 'Claim Rewards';
      case 'reward':
        return 'Reward';
      default:
        return type;
    }
  };

  const handleLoadMore = () => {
    setVisibleTransactions(prev => prev + 50);
  };

  const visibleData = transactions?.slice(0, visibleTransactions);
  const hasMore = transactions && visibleTransactions < transactions.length;

  // Prepare data for the chart
  const chartData = transactions.map(tx => ({
    date: new Date(tx.createdAt).getTime(),
    amount: parseFloat(tx.amount),
    type: tx.type
  }));

  // Calculate summary statistics for only stake and reward transactions
  const summary = transactions.reduce((acc, tx) => {
    if (tx.type === 'stake' || tx.type === 'reward') {
      if (!acc[tx.type]) {
        acc[tx.type] = {
          count: 0,
          total: 0
        };
      }
      acc[tx.type].count++;
      acc[tx.type].total += parseFloat(tx.amount);
    }
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-white">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : visibleData && visibleData.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="chart">Chart View</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="bg-zinc-800/50">
                  <CardContent className="pt-6">
                    <div className="text-sm text-zinc-400">Total Stake</div>
                    <div className="text-2xl font-bold text-white">
                      {(summary.stake?.total || 0).toFixed(6)} PIVX
                    </div>
                    <div className="text-sm text-zinc-400">
                      {summary.stake?.count || 0} transactions
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-800/50">
                  <CardContent className="pt-6">
                    <div className="text-sm text-zinc-400">Total Rewards</div>
                    <div className="text-2xl font-bold text-green-400">
                      {(summary.reward?.total || 0).toFixed(9)} PIVX
                    </div>
                    <div className="text-sm text-zinc-400">
                      {summary.reward?.count || 0} transactions
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="relative overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-sm text-zinc-400">
                    <tr>
                      <th className="pb-4">Type</th>
                      <th className="pb-4">Amount</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {visibleData.map((tx) => (
                      <tr key={tx.id} className="border-t border-zinc-800">
                        <td className="py-4 text-white">
                          {getTypeLabel(tx.type)}
                        </td>
                        <td className="py-4 text-white">
                          {tx.type === 'reward' 
                            ? parseFloat(tx.amount).toFixed(9)
                            : parseFloat(tx.amount).toFixed(6)} PIVX
                        </td>
                        <td className={`py-4 ${getStatusColor(tx.status)} capitalize`}>
                          {tx.status}
                        </td>
                        <td className="py-4 text-zinc-400">
                          {format(new Date(tx.createdAt), 'MMM d, yyyy HH:mm')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="chart">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="date"
                      type="number"
                      scale="time"
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                      stroke="#71717a"
                    />
                    <YAxis 
                      stroke="#71717a"
                      tickFormatter={(value) => `${value.toFixed(9)} PIVX`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #3f3f46",
                        borderRadius: "6px",
                      }}
                      labelStyle={{ color: "#e4e4e7" }}
                      labelFormatter={(value) => format(new Date(value), 'PPP')}
                      formatter={(value: number) => [`${value.toFixed(9)} PIVX`]}
                    />
                    <Line 
                      type="monotone"
                      dataKey="amount"
                      stroke="#8b5cf6"
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <p className="text-center py-8 text-zinc-400">No transactions found</p>
        )}

        {hasMore && activeTab === "table" && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              className="bg-zinc-800 hover:bg-zinc-700"
            >
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}