import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SiEthereum, SiSolana } from "react-icons/si";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import TransactionHistory from "@/components/transaction/TransactionHistory";
import { Wallet } from "lucide-react";

interface PortfolioData {
  eth: {
    staked: number;
    rewards: number;
    apy: number;
    status: 'active' | 'ended';
  };
}

async function fetchPortfolioData(): Promise<PortfolioData> {
  const response = await fetch('/api/portfolio');
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio data');
  }
  return response.json();
}

async function withdrawRewards(amount: number, coin: string) {
  const response = await fetch('/api/withdraw', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, coin }),
  });

  if (!response.ok) {
    throw new Error('Failed to withdraw rewards');
  }
  return response.json();
}

async function endStaking(coin: string) {
  const response = await fetch('/api/staking/end', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ coin }),
  });

  if (!response.ok) {
    throw new Error('Failed to end staking');
  }
  return response.json();
}

async function transferToWallet(amount: number, coin: string) {
  const response = await fetch('/api/transfer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, coin }),
  });

  if (!response.ok) {
    throw new Error('Failed to transfer funds');
  }
  return response.json();
}

export default function Portfolio() {
  const [transferAmount, setTransferAmount] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [isEndingStake, setIsEndingStake] = useState(false);
  const { toast } = useToast();

  const { data: portfolio, isLoading, refetch } = useQuery({
    queryKey: ['/api/portfolio'],
    queryFn: fetchPortfolioData,
    refetchInterval: 60000,
    staleTime: 0
  });

  const handleEndStaking = async () => {
    setIsEndingStake(true);
    try {
      await endStaking('ETH');
      toast({
        title: "Staking Ended",
        description: "Your staking position has been ended. You can now withdraw your full amount."
      });
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to End Staking",
        description: error.message
      });
    } finally {
      setIsEndingStake(false);
    }
  };

  const handleTransfer = async (coin: string) => {
    if (!transferAmount) return;

    setIsTransferring(true);
    try {
      await transferToWallet(parseFloat(transferAmount), coin);
      toast({
        title: "Transfer Successful",
        description: `${transferAmount} ${coin} has been transferred to your wallet.`
      });
      setTransferAmount("");
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: error.message
      });
    } finally {
      setIsTransferring(false);
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
            <Badge variant="secondary" className={portfolio?.eth.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
              {portfolio?.eth.status === 'active' ? 'Active' : 'Ended'}
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
                <div className="flex gap-2">
                  {portfolio.eth.status === 'active' ? (
                    <Button 
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                      onClick={handleEndStaking}
                      disabled={isEndingStake}
                    >
                      {isEndingStake ? 'Ending Stake...' : 'End Staking'}
                    </Button>
                  ) : null}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={portfolio.eth.status === 'active'}
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Transfer Total to Wallet
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800">
                      <DialogHeader>
                        <DialogTitle className="text-white">Transfer Total ETH to Wallet</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                          Enter the amount of ETH you want to transfer to your wallet.
                          Maximum Available: {totalValue.toFixed(9)} ETH (Stake + Rewards)
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white"
                          min={0}
                          max={totalValue}
                          step="0.000000001"
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleTransfer('ETH')}
                          disabled={isTransferring || !transferAmount || parseFloat(transferAmount) > totalValue}
                        >
                          {isTransferring ? 'Transferring...' : 'Transfer to Wallet'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
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