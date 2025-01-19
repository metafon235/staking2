import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SiEthereum, SiSolana } from "react-icons/si";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import TransactionHistory from "@/components/transaction/TransactionHistory";

interface PortfolioData {
  eth: {
    staked: number;
    rewards: number;
    apy: number;
  };
}

async function fetchPortfolioData(): Promise<PortfolioData> {
  const response = await fetch('/api/portfolio');
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio data');
  }
  return response.json();
}

async function withdrawAll(coin: string) {
  const response = await fetch('/api/withdraw-all', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ coin }),
  });

  if (!response.ok) {
    throw new Error('Failed to withdraw funds');
  }
  return response.json();
}

export default function Portfolio() {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { toast } = useToast();

  const { data: portfolio, isLoading, refetch } = useQuery({
    queryKey: ['/api/portfolio'],
    queryFn: fetchPortfolioData,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 0 // Always consider data stale to force refresh
  });

  const handleWithdrawAll = async (coin: string) => {
    setIsWithdrawing(true);
    try {
      await withdrawAll(coin);
      toast({
        title: "Withdrawal Successful",
        description: "Your stake and rewards have been withdrawn to your wallet."
      });
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Withdrawal Failed",
        description: error.message
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Calculate totals
  const totalStaked = portfolio ? portfolio.eth.staked : 0;
  const totalRewards = portfolio ? portfolio.eth.rewards : 0;
  const totalValue = totalStaked + totalRewards;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Portfolio Overview</h1>

      {/* Total Overview Card */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-purple-600/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-white">
            Total Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-zinc-300">Total Value Staked</p>
              <p className="text-3xl font-bold text-white">
                {totalStaked.toFixed(9)} ETH
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-300">Total Current Rewards</p>
              <p className="text-3xl font-bold text-green-400">
                {totalRewards.toFixed(9)} ETH
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ETH Staking Card */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium text-white">
              <div className="flex items-center gap-2">
                <SiEthereum className="w-6 h-6" />
                Ethereum Staking
              </div>
            </CardTitle>
            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
              Active
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-[250px] bg-zinc-800" />
                <Skeleton className="h-4 w-[200px] bg-zinc-800" />
              </div>
            ) : portfolio ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-400">Initial Stake</p>
                  <p className="text-2xl font-bold text-white">
                    {portfolio.eth.staked.toFixed(9)} ETH
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Generated Rewards</p>
                  <p className="text-2xl font-bold text-green-500">
                    +{portfolio.eth.rewards.toFixed(9)} ETH
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Total Value (Stake + Rewards)</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {totalValue.toFixed(9)} ETH
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Current APY</p>
                  <p className="text-lg text-purple-400">
                    {portfolio.eth.apy.toFixed(2)}%
                  </p>
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleWithdrawAll('ETH')}
                  disabled={isWithdrawing || totalValue <= 0}
                >
                  {isWithdrawing ? 'Processing Withdrawal...' : 'Withdraw Stake & Rewards'}
                </Button>
              </div>
            ) : (
              <p className="text-zinc-400">Failed to load data</p>
            )}
          </CardContent>
        </Card>

        {/* SOL Staking Card (Coming Soon) */}
        <Card className="bg-zinc-900/50 border-zinc-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 text-lg py-2">
              Coming Soon
            </Badge>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium text-white">
              <div className="flex items-center gap-2">
                <SiSolana className="w-6 h-6" />
                Solana Staking
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-400">Estimated APY</p>
                <p className="text-2xl font-bold text-white">
                  6.50%
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Min. Stake</p>
                <p className="text-2xl font-bold text-white">
                  1.00 SOL
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <div className="col-span-2">
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
}