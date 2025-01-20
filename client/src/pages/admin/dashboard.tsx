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
  Server
} from "lucide-react";

interface SystemOverview {
  users: number;
  totalStaked: number;
  transactions: number;
  systemHealth: {
    cdpApiStatus: string;
    databaseStatus: string;
    lastSync: string;
  }
}

export default function AdminDashboard() {
  const { data: overview, isLoading } = useQuery<SystemOverview>({
    queryKey: ['/api/admin/overview'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ActivityIcon className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">System Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
}
