import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface ActivityMetrics {
  historical: Array<{
    date: string;
    totalValueLocked: string;
    userCount: number;
    activeStakes: number;
    adminRewards: string;
  }>;
  current: {
    totalValueLocked: string;
    userCount: number;
    activeStakes: number;
    adminRewards: number;
    apyDifference: number;
    lastUpdated: string;
  };
}

export default function AdminActivity() {
  const [period, setPeriod] = useState("7d");

  const { data: metrics, isLoading: metricsLoading } = useQuery<ActivityMetrics>({
    queryKey: ['/api/admin/activity/metrics', period],
    refetchInterval: 60000, // Refetch every minute
  });

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Activity & Analytics</h1>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Performance Metrics</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {/* TVL Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Total Value Locked (TVL)</CardTitle>
            <CardDescription>Historical TVL in ETH</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.historical}>
                <defs>
                  <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: string) => parseFloat(value).toFixed(4) + ' ETH'}
                  labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalValueLocked" 
                  stroke="#8884d8" 
                  fill="url(#tvlGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Admin Rewards Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Rewards</CardTitle>
            <CardDescription>
              Based on {metrics?.current.apyDifference}% APY difference
              <br />
              <span className="text-xs text-muted-foreground">
                Updates automatically every minute
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.historical}>
                <defs>
                  <linearGradient id="rewardsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: string) => parseFloat(value).toFixed(6) + ' ETH'}
                  labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                />
                <Area 
                  type="monotone" 
                  dataKey="adminRewards" 
                  stroke="#82ca9d" 
                  fill="url(#rewardsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total registered users over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.historical}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                />
                <Line 
                  type="monotone" 
                  dataKey="userCount" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active Stakes Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Active Stakes</CardTitle>
            <CardDescription>Number of active stakes over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.historical}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                />
                <Line 
                  type="monotone" 
                  dataKey="activeStakes" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}