import { memo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PiCurrencyCircleDollarFill } from "react-icons/pi";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import TransactionHistory from "@/components/transaction/TransactionHistory";
import SharePortfolioDialog from "@/components/portfolio/SharePortfolioDialog";
import AutoCompoundingDialog from "@/components/portfolio/AutoCompoundingDialog";
import { format } from "date-fns";
import { PivxIcon } from "@/components/icons/PivxIcon";
import { getPIVXPrice } from "@/lib/binance";  // Changed from coinmarketcap to cryptocompare

interface PortfolioData {
  pivx: {
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
    const error = await response.json();
    throw new Error(error.error || 'Failed to withdraw funds');
  }
  return response.json();
}

function PortfolioContent() {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { toast } = useToast();
  const portfolioRef = useRef<HTMLDivElement>(null);

  const { data: portfolio, isLoading, refetch } = useQuery({
    queryKey: ['/api/portfolio'],
    queryFn: fetchPortfolioData,
    refetchInterval: 60000,
    staleTime: 0
  });

  const { data: pivxPrice } = useQuery({
    queryKey: ['pivx-price'],
    queryFn: getPIVXPrice,
    refetchInterval: 60000,
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
  const totalStaked = portfolio?.pivx?.staked || 0;
  const totalRewards = portfolio?.pivx?.rewards || 0;
  const totalValue = totalStaked + totalRewards;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Portfolio Overview</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>Updates every minute</span>
            <span>•</span>
            <span>Last updated: {format(new Date(), 'h:mm:ss a')}</span>
          </div>
          <SharePortfolioDialog portfolioRef={portfolioRef} />
        </div>
      </div>

      <div ref={portfolioRef} className="space-y-6 bg-zinc-900 p-6 rounded-lg">
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
                  {totalStaked.toFixed(2)} PIVX
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-300">Total Current Rewards</p>
                <p className="text-3xl font-bold text-green-400">
                  {totalRewards.toFixed(2)} PIVX
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium text-white">
                <div className="flex items-center gap-2">
                  <PivxIcon className="w-6 h-6 text-purple-400" />
                  PIVX Staking
                  {pivxPrice && (
                    <span className="text-sm text-zinc-400">
                      (${pivxPrice.toFixed(4)})
                    </span>
                  )}
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
              ) : portfolio?.pivx ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-zinc-400">Initial Stake</p>
                    <p className="text-2xl font-bold text-white">
                      {portfolio.pivx.staked.toFixed(2)} PIVX
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Generated Rewards</p>
                    <p className="text-2xl font-bold text-green-500">
                      +{portfolio.pivx.rewards.toFixed(2)} PIVX
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Total Value (Stake + Rewards)</p>
                    <p className="text-2xl font-bold text-purple-500">
                      {totalValue.toFixed(2)} PIVX
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Current APY</p>
                    <p className="text-lg text-purple-400">
                      10.00%
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-400">No staking data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 text-lg py-2">
                Coming Soon
              </Badge>
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium text-white">
                <div className="flex items-center gap-2">
                  <PiCurrencyCircleDollarFill className="w-6 h-6" />
                  Multi-Coin Staking
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-400">Estimated APY</p>
                  <p className="text-2xl font-bold text-white">
                    10.00%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Min. Stake</p>
                  <p className="text-2xl font-bold text-white">
                    100.00 PIVX
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <div className="grid gap-6">
          {portfolio?.pivx && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleWithdrawAll('PIVX')}
                    disabled={isWithdrawing || totalValue <= 0}
                  >
                    {isWithdrawing ? 'Processing Withdrawal...' : 'Withdraw Stake & Rewards'}
                  </Button>
                  <AutoCompoundingDialog
                    currentAllocation={{
                      pivx: 100,
                      sol: 0,
                      dot: 0
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <TransactionHistory />
        </div>
      </div>
    </div>
  );
}

function Portfolio() {
  return (
    <AppLayout>
      <PortfolioContent />
    </AppLayout>
  );
}

export default memo(Portfolio);