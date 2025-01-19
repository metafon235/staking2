import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    stakingPositions: Array<{
      coin: string;
      amount: number;
      value: number;
      apy: number;
    }>;
    priceHistory: Array<{
      timestamp: number;
      price: number;
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
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics'],
    queryFn: fetchAnalyticsData,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
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
                  {typeof analytics.performance.roi === 'number' ? 
                    `${analytics.performance.roi.toFixed(2)}%` : '0.00%'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Current APY</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-500">
                  {typeof analytics.performance.apy === 'number' ? 
                    `${analytics.performance.apy.toFixed(2)}%` : '0.00%'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Total Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-500">
                  {typeof analytics.performance.totalRewards === 'number' ? 
                    `${analytics.performance.totalRewards.toFixed(6)} ETH` : '0.000000 ETH'}
                </p>
              </CardContent>
            </Card>
          </div>

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
                  {typeof analytics.network.validatorEffectiveness === 'number' ? 
                    `${analytics.network.validatorEffectiveness.toFixed(2)}%` : '0.00%'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Network Health</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-500">
                  {typeof analytics.network.networkHealth === 'number' ? 
                    `${analytics.network.networkHealth.toFixed(2)}%` : '0.00%'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Participation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-500">
                  {typeof analytics.network.participationRate === 'number' ? 
                    `${analytics.network.participationRate.toFixed(2)}%` : '0.00%'}
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
                  {typeof analytics.portfolio.totalValue === 'number' ? 
                    `${analytics.portfolio.totalValue.toFixed(2)} ETH` : '0.00 ETH'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Profit/Loss</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${
                  analytics.portfolio.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {typeof analytics.portfolio.profitLoss === 'number' ? 
                    `${analytics.portfolio.profitLoss >= 0 ? '+' : ''}${analytics.portfolio.profitLoss.toFixed(2)} ETH` : 
                    '0.00 ETH'}
                </p>
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

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Price History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.portfolio.priceHistory.map(point => ({
                    ...point,
                    date: format(point.timestamp, 'MMM dd')
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}