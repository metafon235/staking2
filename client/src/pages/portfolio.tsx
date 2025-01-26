import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SiEthereum, SiSolana } from "react-icons/si";
import { PiCurrencyCircleDollarFill } from "react-icons/pi";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import TransactionHistory from "@/components/transaction/TransactionHistory";
import SharePortfolioDialog from "@/components/portfolio/SharePortfolioDialog";
import AutoCompoundingDialog from "@/components/portfolio/AutoCompoundingDialog";
import { format } from "date-fns";

interface PortfolioData {
  pivx?: {
    staked: number;
    rewards: number;
    apy: number;
  };
  eth?: {
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

export default function Portfolio() {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { toast } = useToast();
  const portfolioRef = useRef<HTMLDivElement>(null);

  const { data: portfolio, isLoading, refetch } = useQuery({
    queryKey: ['/api/portfolio'],
    queryFn: fetchPortfolioData,
    refetchInterval: 60000, 
    staleTime: 0 
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

  // Calculate PIVX totals
  const totalPivxStaked = portfolio?.pivx?.staked || 0;
  const totalPivxRewards = portfolio?.pivx?.rewards || 0;
  const totalPivxValue = totalPivxStaked + totalPivxRewards;

  //Calculate ETH totals
  const totalEthStaked = portfolio?.eth?.staked || 0;
  const totalEthRewards = portfolio?.eth?.rewards || 0;
  const totalEthValue = totalEthStaked + totalEthRewards;


  return (
    <div className="space-y-6">
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
                  {(totalEthStaked + totalPivxStaked).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-300">Total Current Rewards</p>
                <p className="text-3xl font-bold text-green-400">
                  {(totalEthRewards + totalPivxRewards).toFixed(2)}
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
              ) : portfolio?.eth ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-zinc-400">Initial Stake</p>
                    <p className="text-2xl font-bold text-white">
                      {portfolio.eth.staked.toFixed(2)} ETH
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Generated Rewards</p>
                    <p className="text-2xl font-bold text-green-500">
                      +{portfolio.eth.rewards.toFixed(2)} ETH
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Total Value (Stake + Rewards)</p>
                    <p className="text-2xl font-bold text-purple-500">
                      {totalEthValue.toFixed(2)} ETH
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Current APY</p>
                    <p className="text-lg text-purple-400">
                      {portfolio.eth.apy.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-400">No ETH staking data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium text-white">
                <div className="flex items-center gap-2">
                  <PiCurrencyCircleDollarFill className="w-6 h-6" />
                  PIVX Staking
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
                      {totalPivxValue.toFixed(2)} PIVX
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Current APY</p>
                    <p className="text-lg text-purple-400">
                      {portfolio.pivx.apy.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-400">No PIVX staking data available</p>
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
        </div>
      </div>

      <div className="mt-6">
        <div className="grid gap-6">
          {(portfolio?.eth || portfolio?.pivx) && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-4">
                  {portfolio?.eth && (
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleWithdrawAll('ETH')}
                      disabled={isWithdrawing || totalEthValue <= 0}
                    >
                      {isWithdrawing ? 'Processing Withdrawal...' : 'Withdraw Stake & Rewards'}
                    </Button>
                  )}
                  {portfolio?.pivx && (
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleWithdrawAll('PIVX')}
                      disabled={isWithdrawing || totalPivxValue <= 0}
                    >
                      {isWithdrawing ? 'Processing Withdrawal...' : 'Withdraw Stake & Rewards'}
                    </Button>
                  )}
                  <AutoCompoundingDialog
                    currentAllocation={{
                      eth: portfolio?.eth ? 100 : 0,
                      sol: 0,
                      dot: 0,
                      pivx: portfolio?.pivx ? 100 : 0
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