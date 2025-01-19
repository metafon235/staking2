import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface Transaction {
  id: number;
  type: 'stake' | 'withdraw' | 'claim';
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
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: fetchTransactionHistory,
    refetchInterval: 30000, // Refresh every 30 seconds
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
      default:
        return type;
    }
  };

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
        ) : transactions && transactions.length > 0 ? (
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
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-zinc-800">
                    <td className="py-4 text-white">
                      {getTypeLabel(tx.type)}
                    </td>
                    <td className="py-4 text-white">
                      {parseFloat(tx.amount).toFixed(9)} ETH
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
        ) : (
          <p className="text-center py-8 text-zinc-400">No transactions found</p>
        )}
      </CardContent>
    </Card>
  );
}
