import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StakingUser {
  id: number;
  username: string;
  walletAddress: string;
  totalStaked: number;
  currentRewards: number;
  lastRewardTimestamp: string;
}

export default function AdminStaking() {
  const { user } = useUser();
  const [, setLocation] = useLocation();

  const { data: stakingUsers, isLoading } = useQuery<StakingUser[]>({
    queryKey: ['/api/admin/staking'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Show loading state while checking user
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect non-admin users
  if (!user.isAdmin) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation("/admin/dashboard")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Staking Overview</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Stakes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead className="text-right">Total Staked (ETH)</TableHead>
                    <TableHead className="text-right">Current Rewards (ETH)</TableHead>
                    <TableHead>Last Reward</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stakingUsers?.map((stakingUser) => (
                    <TableRow key={stakingUser.id}>
                      <TableCell className="font-medium">
                        {stakingUser.username}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {stakingUser.walletAddress}
                      </TableCell>
                      <TableCell className="text-right">
                        {stakingUser.totalStaked.toFixed(6)}
                      </TableCell>
                      <TableCell className="text-right">
                        {stakingUser.currentRewards.toFixed(9)}
                      </TableCell>
                      <TableCell>
                        {new Date(stakingUser.lastRewardTimestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!stakingUsers?.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No active stakes found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
