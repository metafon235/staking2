import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RewardsBarChart from "@/components/staking/RewardsBarChart";
import { getEthPrice, getEthStats } from "@/lib/binance";
import MarketStatsChart from "@/components/market/MarketStatsChart";

interface AnalyticsData {
  portfolio: {
    totalStaked: number;
    currentRewards: number;
    totalValue: number;
    roi: number;
  };
  history: {
    rewards: Array<{
      timestamp: number;
      value: number;
    }>;
    prices: Array<{
      timestamp: number;
      price: number;
    }>;
    validators: Array<{
      timestamp: number;
      activeValidators: number;
      effectiveness: number;
    }>;
  };
  network: {
    health: number;
    participationRate: number;
    validatorEffectiveness: number;
  };
}

async function fetchAnalyticsData(): Promise<AnalyticsData> {
  const response = await fetch('/api/analytics');
  if (!response.ok) {
    throw new Error('Failed to fetch analytics data');
  }
  return response.json();
}

export default function Analytics() {
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['/api/analytics'],
    queryFn: fetchAnalyticsData,
    refetchInterval: 60000,
  });

  const { data: liveEthPrice } = useQuery({
    queryKey: ['binanceEthPrice'],
    queryFn: getEthPrice,
    refetchInterval: 30000,
  });

  const { data: ethStats } = useQuery({
    queryKey: ['binanceEthStats'],
    queryFn: getEthStats,
    staleTime: Infinity,
  });

  if (isLoadingAnalytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-zinc-400 py-8">
        Failed to load analytics data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">
                  {analytics.portfolio.roi.toFixed(6)}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Current APY</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-500">
                  3.00%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Total Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-500">
                  {analytics.portfolio.currentRewards.toFixed(6)} ETH
                </p>
              </CardContent>
            </Card>
          </div>

          <RewardsBarChart />

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Rewards History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.history.rewards.map(point => ({
                    ...point,
                    date: format(point.timestamp, 'MMM dd'),
                    rewards: point.value
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Line type="monotone" dataKey="rewards" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Validator Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">
                  {analytics.network.validatorEffectiveness.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Network Health</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-500">
                  {analytics.network.health.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Participation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-500">
                  {analytics.network.participationRate.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Validator History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.history.validators.map(point => ({
                    ...point,
                    date: format(point.timestamp, 'MMM dd')
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Line type="monotone" dataKey="activeValidators" stroke="#8884d8" name="Active Validators" />
                    <Line type="monotone" dataKey="effectiveness" stroke="#82ca9d" name="Effectiveness" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">
                  {analytics.portfolio.totalValue.toFixed(6)} ETH
                </p>
                <p className="text-lg text-zinc-400">
                  ${(analytics.portfolio.totalValue * (liveEthPrice || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Total Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-500">
                  {analytics.portfolio.currentRewards.toFixed(6)} ETH
                </p>
                <p className="text-lg text-zinc-400">
                  ${(analytics.portfolio.currentRewards * (liveEthPrice || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Live ETH Price</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-500">
                  ${liveEthPrice ? liveEthPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00'}
                </p>
                <p className="text-sm text-zinc-400">
                  {liveEthPrice ? 'Updates every 30 seconds' : 'Fetching price...'}
                </p>
              </CardContent>
            </Card>
          </div>

          {ethStats && (
            <MarketStatsChart
              priceChange24h={ethStats.priceChange24h}
              priceChangePercent24h={ethStats.priceChangePercent24h}
              volume24h={ethStats.volume24h}
              highPrice24h={ethStats.highPrice24h}
              lowPrice24h={ethStats.lowPrice24h}
              weightedAvgPrice={ethStats.weightedAvgPrice}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}