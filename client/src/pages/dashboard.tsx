import StakingCard from "@/components/staking/StakingCard";
import StakingStats from "@/components/staking/StakingStats";
import StakingChart from "@/components/staking/StakingChart";
import { useQuery } from "@tanstack/react-query";
import { getStakingData } from "@/lib/web3";
import NotificationBell from "@/components/layout/NotificationBell";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stakingData, isLoading } = useQuery({
    queryKey: ['/api/staking/data'],
    queryFn: getStakingData,
    refetchInterval: 300000, // Refresh every 5 minutes instead of every minute
    staleTime: 240000, // Consider data fresh for 4 minutes
    retry: false,
    refetchOnWindowFocus: false // Prevent refetching on window focus
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Staking Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>Updates every 5 minutes</span>
            <span>•</span>
            <span>Last updated: {format(new Date(), 'HH:mm:ss')}</span>
          </div>
          <NotificationBell />
        </div>
      </div>

      <div className="grid gap-6">
        <StakingChart 
          data={stakingData?.rewardsHistory || []}
          totalStaked={stakingData?.totalStaked || 0}
          currentRewards={stakingData?.rewards || 0}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StakingStats 
          totalStaked={stakingData?.totalStaked || 0}
          rewards={stakingData?.rewards || 0}
          monthlyRewards={stakingData?.monthlyRewards || 0}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6">
        <StakingCard isLoading={isLoading} />
      </div>
    </div>
  );
}