import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ActivityIcon,
  Users,
  Wallet,
  Activity,
  Server,
  Settings,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SystemOverview {
  users: number;
  totalStaked: number;
  transactions: number;
  stakingConfig: Array<{
    coinSymbol: string;
    displayedApy: number;
    actualApy: number;
    minStakeAmount: string;
  }>;
  adminRewards: {
    current: number;
    monthly: number;
    yearly: number;
  };
  systemHealth: {
    cdpApiStatus: string;
    databaseStatus: string;
    lastSync: string;
  };
}

export default function AdminDashboard() {
  const { data: overview, isLoading } = useQuery<SystemOverview>({
    queryKey: ['/api/admin/overview'],
    refetchInterval: 60000, // Refetch every minute (60000ms)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ActivityIcon className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // Calculate admin earnings for ETH staking
  const ethConfig = overview?.stakingConfig.find(config => config.coinSymbol === 'ETH');
  const apyDiff = ethConfig ? (ethConfig.actualApy - ethConfig.displayedApy) : 0;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">System Overview</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.users ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered platform users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.totalStaked ? `${overview.totalStaked.toFixed(2)} ETH` : '0 ETH'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total staked amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.transactions ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Total platform transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">CDP API</span>
                <span className={`text-sm ${
                  overview?.systemHealth.cdpApiStatus === 'operational' 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {overview?.systemHealth.cdpApiStatus ?? 'unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <span className={`text-sm ${
                  overview?.systemHealth.databaseStatus === 'healthy' 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {overview?.systemHealth.databaseStatus ?? 'unknown'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Admin Rewards & Platform Earnings</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Admin Rewards</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.adminRewards.current.toFixed(6)} ETH
            </div>
            <p className="text-xs text-muted-foreground">
              Accumulated from {apyDiff.toFixed(2)}% APY difference
            </p>
            <p className="text-xs text-muted-foreground mt-1 italic">
              Updates automatically every minute
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Platform Earnings</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.adminRewards.monthly.toFixed(6)} ETH
            </div>
            <p className="text-xs text-muted-foreground">
              Based on current TVL and {apyDiff.toFixed(2)}% difference
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Platform Earnings</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview?.adminRewards.yearly.toFixed(6)} ETH
            </div>
            <p className="text-xs text-muted-foreground">
              Projected annual earnings at current TVL
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Staking Settings</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {overview?.stakingConfig.map((config) => (
          <Card key={config.coinSymbol}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{config.coinSymbol} Staking</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit {config.coinSymbol} Staking Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Displayed APY (%)</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={config.displayedApy}
                        readOnly
                      />
                      <p className="text-sm text-muted-foreground">
                        Fixed at {config.displayedApy}% for users
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Actual APY (%)</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={config.actualApy}
                        readOnly
                      />
                      <p className="text-sm text-muted-foreground">
                        Fixed at {config.actualApy}% for admin earnings
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>APY Difference</Label>
                      <div className="text-lg font-bold text-green-600">
                        +{(config.actualApy - config.displayedApy).toFixed(2)}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Platform profit margin
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Stake</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={config.minStakeAmount}
                        readOnly
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Displayed APY</span>
                  <span className="text-sm font-medium">{config.displayedApy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Actual APY</span>
                  <span className="text-sm font-medium">{config.actualApy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Min Stake</span>
                  <span className="text-sm font-medium">{config.minStakeAmount} {config.coinSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Profit Margin</span>
                  <span className="text-sm font-medium text-green-600">
                    +{(config.actualApy - config.displayedApy).toFixed(2)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}