import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import NetworkStatsChart from "@/components/network/NetworkStatsChart";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";
import { COIN_DATA } from "@/config/coins";
import CoinDocumentation from "@/components/coins/CoinDocumentation";

interface CoinDetailProps {
  symbol?: string;
}

function CoinDetailContent({ symbol = 'pivx' }: CoinDetailProps) {
  const { user } = useUser();
  const [, navigate] = useLocation();
  const lowercaseSymbol = symbol.toLowerCase();

  const { data: networkStats, isLoading: isLoadingStats } = useQuery({
    queryKey: [`/api/network-stats/${lowercaseSymbol}`],
    queryFn: () => fetchNetworkStats(lowercaseSymbol),
    enabled: true,
    refetchInterval: 60000,
    staleTime: 0
  });

  const coinData = COIN_DATA[lowercaseSymbol];
  if (!coinData) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Coin not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleStartStaking = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate(`/app/coins/${lowercaseSymbol}`);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center gap-4 mb-8">
            <coinData.icon className="w-12 h-12 text-purple-400" />
            <div>
              <h1 className="text-4xl font-bold text-white">{coinData.name}</h1>
              <p className="text-lg text-zinc-400">
                Learn more about {coinData.name} Staking
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Overview Card */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-zinc-400 text-justify">{coinData.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-400">Annual Return</p>
                      <p className="text-2xl font-bold text-purple-400">{coinData.apy}% APY</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Minimum stake</p>
                      <p className="text-2xl font-bold text-white">
                        {coinData.minStake} {coinData.symbol}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4"
                    onClick={handleStartStaking}
                    disabled={!coinData.enabled}
                  >
                    {!coinData.enabled
                      ? "Coming Soon"
                      : user
                        ? "Start Staking"
                        : `Stake ${coinData.name}`}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Network Statistics Card */}
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
                        <p className="text-xs text-zinc-400">Average Stake</p>
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
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} {coinData.symbol}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-zinc-400 text-center py-4">
                      Error loading network statistics
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Network Stats Chart */}
              {networkStats && (
                <NetworkStatsChart
                  data={networkStats.history}
                  symbol={coinData.symbol}
                />
              )}

              {/* Documentation */}
              <CoinDocumentation
                symbol={coinData.symbol}
                technicalDetails={coinData.technicalDetails}
                stakingDetails={coinData.stakingDetails}
                documentation={coinData.documentation}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoinDetail({ symbol }: CoinDetailProps) {
  return <CoinDetailContent symbol={symbol} />;
}

// Types and API functions
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