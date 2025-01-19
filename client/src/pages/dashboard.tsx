import StakingCard from "@/components/staking/StakingCard";
import StakingStats from "@/components/staking/StakingStats";
import RewardsChart from "@/components/staking/RewardsChart";
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
        <h1 className="text-3xl font-bold">Staking Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[120px] rounded-lg" />
          <Skeleton className="h-[120px] rounded-lg" />
          <Skeleton className="h-[120px] rounded-lg" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Staking Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Updates every minute • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StakingStats 
          totalStaked={stakingData?.totalStaked || 0}
          rewards={stakingData?.rewards || 0}
          projectedEarnings={stakingData?.projected || 0}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StakingCard />
        <RewardsChart data={stakingData?.rewardsHistory || []} />
      </div>
    </div>
  );
}