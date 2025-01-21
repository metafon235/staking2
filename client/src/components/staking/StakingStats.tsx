import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StakingStatsProps {
  totalStaked: number;
  rewards: number;
  monthlyRewards: number;
  isLoading?: boolean;
}

export default function StakingStats({
  totalStaked,
  rewards,
  monthlyRewards,
  isLoading
}: StakingStatsProps) {
  if (isLoading) {
    return (
      <>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <Skeleton className="h-20 bg-zinc-800" />
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <Skeleton className="h-20 bg-zinc-800" />
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <Skeleton className="h-20 bg-zinc-800" />
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">Total Staked</p>
            <h2 className="text-3xl font-bold text-white">{totalStaked.toFixed(6)} ETH</h2>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">Current Rewards</p>
            <h2 className="text-3xl font-bold text-white">{rewards.toFixed(9)} ETH</h2>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">Monthly Rewards</p>
            <h2 className="text-3xl font-bold text-white">{monthlyRewards.toFixed(9)} ETH</h2>
          </div>
        </CardContent>
      </Card>
    </>
  );
}