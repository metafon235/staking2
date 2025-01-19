import StakingCard from "@/components/staking/StakingCard";
import StakingStats from "@/components/staking/StakingStats";
import StakingChart from "@/components/staking/StakingChart";
import RewardsBarChart from "@/components/staking/RewardsBarChart";
import { useQuery } from "@tanstack/react-query";
import { getStakingData } from "@/lib/web3";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stakingData, isLoading } = useQuery({
    queryKey: ["/api/staking/data"],
    queryFn: getStakingData,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 0 // Always consider data stale to force refresh
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Staking Dashboard</h1>
        <Skeleton className="h-[400px] rounded-lg bg-zinc-800" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[120px] rounded-lg bg-zinc-800" />
          <Skeleton className="h-[120px] rounded-lg bg-zinc-800" />
          <Skeleton className="h-[120px] rounded-lg bg-zinc-800" />
        </div>
        <Skeleton className="h-[300px] rounded-lg bg-zinc-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Staking Dashboard</h1>
        <p className="text-sm text-zinc-400">
          Updates every minute • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>

      <div className="grid gap-6">
        <StakingChart 
          data={stakingData?.rewardsHistory || []}
          totalStaked={stakingData?.totalStaked || 0}
          currentRewards={stakingData?.rewards || 0}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StakingStats 
          totalStaked={stakingData?.totalStaked || 0}
          rewards={stakingData?.rewards || 0}
          monthlyRewards={stakingData?.monthlyRewards || 0}
        />
      </div>

      <div className="grid gap-6">
        <RewardsBarChart />
      </div>

      <div className="grid gap-6">
        <StakingCard />
      </div>
    </div>
  );
}