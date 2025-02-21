import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RewardsBarChart from "@/components/staking/RewardsBarChart";
import MarketStatsChart from "@/components/market/MarketStatsChart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";
import { getPIVXPrice as getPIVXPriceCC } from "@/lib/cryptocompare";
import { getPIVXPrice as getPIVXPriceBinance } from "@/lib/binance";

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
    pivxPrice: number;
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

function AnalyticsContent() {
  const [timeRange, setTimeRange] = useState<'days' | 'weeks' | 'months'>('days');
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['/api/analytics'],
    queryFn: fetchAnalyticsData,
    refetchInterval: 60000,
  });

  const { data: pivxPrice, isLoading: isPivxPriceLoading } = useQuery({
    queryKey: ['pivx-price'],
    queryFn: async () => {
      try {
        return await getPIVXPriceCC();
      } catch (error) {
        console.error("CryptoCompare failed:", error);
        try {
          return await getPIVXPriceBinance();
        } catch (binanceError) {
          console.error("Binance fallback failed:", binanceError);
          return 5.23; // Current PIVX price as fallback
        }
      }
    },
    refetchInterval: 30000,
    staleTime: 0,
  });

  if (isLoadingAnalytics || isPivxPriceLoading) {
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

  const totalValueUSD = (analytics?.portfolio?.totalValue ?? 0) * (pivxPrice ?? 0);
  const profitLossUSD = (analytics?.portfolio?.profitLoss ?? 0) * (pivxPrice ?? 0);

  return (
    <div className="space-y-6 p-6">
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
                  {(analytics.performance.roi > 0 
                    ? '+' + analytics.performance.roi.toLocaleString(undefined, {
                        minimumFractionDigits: 8,
                        maximumFractionDigits: 8
                      })
                    : analytics.performance.roi.toLocaleString(undefined, {
                        minimumFractionDigits: 8,
                        maximumFractionDigits: 8
                      })
                  )}%
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
                  {analytics.performance.totalRewards.toFixed(9)} PIVX
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">All My Rewards</h2>
              <ToggleGroup
                type="single"
                value={timeRange}
                onValueChange={(value: 'days' | 'weeks' | 'months') => value && setTimeRange(value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg"
              >
                <ToggleGroupItem
                  value="days"
                  className="text-sm data-[state=on]:bg-purple-600 data-[state=on]:text-white"
                >
                  Days
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="weeks"
                  className="text-sm data-[state=on]:bg-purple-600 data-[state=on]:text-white"
                >
                  Weeks
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="months"
                  className="text-sm data-[state=on]:bg-purple-600 data-[state=on]:text-white"
                >
                  Months
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <RewardsBarChart timeRange={timeRange} />
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Rewards History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.performance?.rewardsHistory?.map(point => ({
                    ...point,
                    date: format(point.timestamp, 'MMM dd'),
                    rewards: parseFloat(point.value.toFixed(9))
                  })) || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis
                      dataKey="date"
                      stroke="#888"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#888"
                      fontSize={12}
                      tickFormatter={(value) => value.toFixed(9)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #3f3f46",
                        borderRadius: "6px",
                      }}
                      labelStyle={{ color: "#e4e4e7" }}
                      itemStyle={{ color: "#8b5cf6" }}
                      formatter={(value: number) => [`${value.toFixed(9)} PIVX`, 'Rewards']}
                      labelFormatter={(value) => format(new Date(value), 'PPP')}
                    />
                    <Line
                      type="monotone"
                      dataKey="rewards"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={false}
                    />
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
                  {analytics?.portfolio?.totalValue || '0.000000'} PIVX
                </p>
                <p className="text-lg text-zinc-400">
                  ${totalValueUSD.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}
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
                  {analytics?.portfolio?.profitLoss || '0.000000'} PIVX
                </p>
                <p className={`text-lg ${
                  profitLossUSD >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {profitLossUSD >= 0 ? '+' : ''}
                  ${Math.abs(profitLossUSD).toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Live PIVX Price</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-500">
                  ${pivxPrice ? pivxPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00'}
                </p>
                <p className="text-sm text-zinc-400">
                  Updates every 30 seconds
                </p>
              </CardContent>
            </Card>
          </div>

          <MarketStatsChart />

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
                        {position.value.toFixed(6)} PIVX
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

export default function Analytics() {
  return (
    <AppLayout>
      <AnalyticsContent />
    </AppLayout>
  );
}