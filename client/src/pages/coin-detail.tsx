import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { SiEthereum, SiPolkadot, SiSolana } from "react-icons/si";
import { useUser } from "@/hooks/use-user";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import NetworkStatsChart from "@/components/network/NetworkStatsChart";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { stakeETH } from "@/lib/web3";

interface NetworkStats {
  current: {
    tvl: number;
    validators: number;
    avgStake: number;
    rewards: number;
  };
  history: Array<{
    date: number;
    tvl: number;
    validators: number;
    avgStake: number;
    rewards: number;
  }>;
  lastUpdated: string;
}

async function fetchNetworkStats(symbol: string): Promise<NetworkStats> {
  const response = await fetch(`/api/network-stats/${symbol}`);
  if (!response.ok) {
    throw new Error('Failed to fetch network statistics');
  }
  return response.json();
}

export default function CoinDetail() {
  const { symbol } = useParams();
  const [stakeAmount, setStakeAmount] = useState("");
  const { user } = useUser();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch settings to check if wallet is set up (only if user is authenticated)
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
    enabled: !!user // Only fetch if user is logged in
  });

  const { data: networkStats, isLoading: isLoadingStats } = useQuery({
    queryKey: [`/api/network-stats/${symbol}`],
    queryFn: () => fetchNetworkStats(symbol || ''),
    enabled: !!symbol,
    refetchInterval: 60000,
    staleTime: 0
  });

  const stakeMutation = useMutation({
    mutationFn: () => stakeETH(parseFloat(stakeAmount)),
    onSuccess: () => {
      toast({
        title: "Staking Successful",
        description: `Successfully staked ${stakeAmount} ETH. Your rewards will start accumulating.`
      });
      setStakeAmount("");
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/staking/data'] });
      queryClient.invalidateQueries({ queryKey: ['/api/network-stats/eth'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Staking Failed",
        description: error.message
      });
    }
  });

  const coinData = COIN_DATA[symbol as keyof typeof COIN_DATA];

  if (!coinData) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Coin not found</h1>
        </div>
      </div>
    );
  }

  const Icon = coinData.icon;
  const monthlyReward = parseFloat(stakeAmount || "0") * (coinData.apy / 12 / 100);
  const yearlyReward = parseFloat(stakeAmount || "0") * (coinData.apy / 100);
  const hasWallet = settings?.walletAddress && settings.walletAddress.length > 0;

  const handleStake = () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!hasWallet) {
      toast({
        variant: "destructive",
        title: "Wallet Required",
        description: "Please set up your wallet address in settings first."
      });
      return;
    }

    const amountNum = parseFloat(stakeAmount);
    if (!stakeAmount || amountNum < parseFloat(coinData.minStake)) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: `Minimum stake amount is ${coinData.minStake} ${coinData.symbol}`
      });
      return;
    }

    stakeMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Icon className="w-12 h-12 text-white" />
          <h1 className="text-4xl font-bold text-white">{coinData.name} Staking</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-zinc-400">{coinData.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-400">Annual Percentage Yield</p>
                    <p className="text-2xl font-bold text-purple-400">{coinData.apy}% APY</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Minimum Stake</p>
                    <p className="text-2xl font-bold text-white">
                      {coinData.minStake} {coinData.symbol}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {coinData.enabled && (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Stake {coinData.symbol}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!user && (
                    <Alert className="bg-yellow-900/20 border-yellow-900/50 text-yellow-500">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please{" "}
                        <a href="/auth" className="underline hover:text-yellow-400">
                          login or create an account
                        </a>{" "}
                        to start staking.
                      </AlertDescription>
                    </Alert>
                  )}

                  {user && !hasWallet && (
                    <Alert className="bg-yellow-900/20 border-yellow-900/50 text-yellow-500">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please set up your funding/withdrawal wallet address in{" "}
                        <a href="/app/settings" className="underline hover:text-yellow-400">
                          Settings
                        </a>{" "}
                        to enable staking.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400 mb-2 block">
                      Amount to stake ({coinData.symbol})
                    </label>
                    <Input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      min={coinData.minStake}
                      step="0.01"
                      placeholder={`Min. ${coinData.minStake} ${coinData.symbol}`}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      disabled={!user || !hasWallet || stakeMutation.isPending}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-400">Monthly Rewards</p>
                      <p className="text-2xl font-bold text-white">
                        {monthlyReward.toFixed(6)} {coinData.symbol}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Yearly Rewards</p>
                      <p className="text-2xl font-bold text-white">
                        {yearlyReward.toFixed(6)} {coinData.symbol}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={handleStake}
                    disabled={
                      !user ||
                      !hasWallet ||
                      stakeMutation.isPending ||
                      !stakeAmount ||
                      parseFloat(stakeAmount) < parseFloat(coinData.minStake)
                    }
                  >
                    {!user
                      ? "Login to Start Staking"
                      : !hasWallet
                      ? "Set Up Wallet First"
                      : stakeMutation.isPending
                      ? "Staking..."
                      : "Start Staking"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Network Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingStats ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 bg-zinc-800" />
                    ))}
                  </div>
                ) : networkStats ? (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-400">
                        Total {coinData.symbol} Staking
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {networkStats.current.tvl.toLocaleString(undefined, {
                          maximumFractionDigits: 0
                        })} {coinData.symbol}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-400">Active Validators</p>
                      <p className="text-lg font-semibold text-white">
                        {networkStats.current.validators.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-400">Average Stake Size</p>
                      <p className="text-lg font-semibold text-white">
                        {networkStats.current.avgStake.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} {coinData.symbol}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-400">Network Rewards</p>
                      <p className="text-lg font-semibold text-white">
                        {networkStats.current.rewards.toLocaleString(undefined, {
                          minimumFractionDigits: 8,
                          maximumFractionDigits: 8
                        })} {coinData.symbol}
                      </p>
                    </div>
                    <div className="col-span-2 mt-2">
                      <p className="text-xs text-zinc-500 text-right">
                        Last updated: {new Date(networkStats.lastUpdated).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-400 text-center py-4">Failed to load network statistics</p>
                )}
              </CardContent>
            </Card>

            {networkStats && (
              <NetworkStatsChart
                data={networkStats.history}
                symbol={coinData.symbol}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const COIN_DATA = {
  eth: {
    name: "Ethereum",
    symbol: "ETH",
    apy: 3.00,
    minStake: "0.01",
    icon: SiEthereum,
    description: "Ethereum 2.0 staking enables you to earn rewards by participating in network validation.",
    enabled: true
  },
  dot: {
    name: "Polkadot",
    symbol: "DOT",
    apy: 12.00,
    minStake: "5.00",
    icon: SiPolkadot,
    description: "Stake DOT to secure the network and earn rewards through Polkadot's nominated proof-of-stake system.",
    enabled: false
  },
  sol: {
    name: "Solana",
    symbol: "SOL",
    apy: 6.50,
    minStake: "1.00",
    icon: SiSolana,
    description: "Participate in Solana's proof-of-stake consensus mechanism to earn staking rewards.",
    enabled: false
  }
};