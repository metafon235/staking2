import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RewardsBarChart from "@/components/staking/RewardsBarChart";
import { getEthPrice, getEthPriceHistory, getEthStats } from "@/lib/binance";

interface AnalyticsData {
  performance: {
    roi: number;
    apy: number;
    totalRewards: number;
    rewardsHistory: Array<{
      timestamp: number;
      value: number;
    }>;
  };
  network: {
    validatorEffectiveness: number;
    networkHealth: number;
    participationRate: number;
    validatorHistory: Array<{
      timestamp: number;
      activeValidators: number;
      effectiveness: number;
    }>;
  };
  portfolio: {
    totalValue: number;
    profitLoss: number;
    ethPrice: number;
    priceHistory: Array<{
      timestamp: number;
      price: number;
    }>;
    stakingPositions: Array<{
      coin: string;
      amount: number;
      value: number;
      apy: number;
    }>;
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
    refetchInterval: 30000,
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

  const ethPrice = liveEthPrice ?? analytics?.portfolio?.ethPrice ?? 0;
  const totalValueUSD = (analytics?.portfolio?.totalValue ?? 0) * ethPrice;
  const profitLossUSD = (analytics?.portfolio?.profitLoss ?? 0) * ethPrice;

  const priceHistory = ethPriceHistory || analytics?.portfolio?.priceHistory || [];

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
                  {analytics.performance.roi.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Current APY</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-500">
                  {analytics.performance.apy.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Total Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-500">
                  {analytics.performance.totalRewards.toFixed(6)} ETH
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
                  <LineChart data={analytics.performance.rewardsHistory.map(point => ({
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
                  {analytics.network.networkHealth.toFixed(2)}%
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
                  <LineChart data={analytics.network.validatorHistory.map(point => ({
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
                  {analytics?.portfolio?.totalValue?.toFixed(6) || '0.000000'} ETH
                </p>
                <p className="text-lg text-zinc-400">
                  ${totalValueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Profit/Loss</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${
                  (analytics?.portfolio?.profitLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {(analytics?.portfolio?.profitLoss || 0) >= 0 ? '+' : ''}
                  {analytics?.portfolio?.profitLoss?.toFixed(6) || '0.000000'} ETH
                </p>
                <p className={`text-lg ${
                  profitLossUSD >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {profitLossUSD >= 0 ? '+' : ''}
                  ${Math.abs(profitLossUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Live ETH Price</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-500">
                  ${ethPrice ? ethPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00'}
                </p>
                <p className="text-sm text-zinc-400">
                  {liveEthPrice ? 'Updates every 30 seconds' : 'Fetching price...'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">24h Price Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">24h Change</span>
                    <span className={`font-medium ${
                      (ethStats?.priceChangePercent24h || 0) >= 0 
                        ? 'text-green-500 flex items-center' 
                        : 'text-red-500 flex items-center'
                    }`}>
                      {(ethStats?.priceChangePercent24h || 0) >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {ethStats?.priceChangePercent24h.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">24h High</span>
                    <span className="font-medium text-white">
                      ${ethStats?.highPrice24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">24h Low</span>
                    <span className="font-medium text-white">
                      ${ethStats?.lowPrice24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Market Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">24h Volume (ETH)</span>
                    <span className="font-medium text-white">
                      {(ethStats?.volume24h || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Weighted Avg Price</span>
                    <span className="font-medium text-white">
                      ${ethStats?.weightedAvgPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Price Change (24h)</span>
                    <span className={`font-medium ${(ethStats?.priceChange24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${Math.abs(ethStats?.priceChange24h || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Staking Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.portfolio.stakingPositions.map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-zinc-800">
                    <div>
                      <p className="text-white font-medium">{position.coin}</p>
                      <p className="text-sm text-zinc-400">
                        {position.amount.toFixed(6)} {position.coin}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {position.value.toFixed(2)} ETH
                      </p>
                      <p className="text-sm text-green-500">
                        {position.apy.toFixed(2)}% APY
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}