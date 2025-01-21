import StakingCard from "@/components/staking/StakingCard";
import StakingStats from "@/components/staking/StakingStats";
import StakingChart from "@/components/staking/StakingChart";
import { useQuery } from "@tanstack/react-query";
import NotificationBell from "@/components/layout/NotificationBell";
import { format } from "date-fns";
import { memo } from "react";

function DashboardContent() {
  const { data: stakingData, isLoading } = useQuery({
    queryKey: ['/api/staking/data'],
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 25000, // Consider data fresh for 25 seconds
    retry: false,
    refetchOnWindowFocus: true,
    initialData: {
      totalStaked: 0,
      rewards: 0,
      monthlyRewards: 0,
      rewardsHistory: []
    }
  });

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Staking Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>Updates every 30 seconds</span>
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
    </div>
  );
}

export default memo(DashboardContent);