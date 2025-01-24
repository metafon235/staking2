import { format } from "date-fns";
import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import StakingCard from "@/components/staking/StakingCard";
import StakingStats from "@/components/staking/StakingStats";
import StakingChart from "@/components/staking/StakingChart";
import NotificationBell from "@/components/layout/NotificationBell";
import { RewardsCalculator } from "@/components/staking/RewardsCalculator";
import type { StakingData } from "@/lib/types";

function DashboardContent() {
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['/api/portfolio'],
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 4000, // Consider data stale after 4 seconds
    retry: false,
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData, // Keep previous data while refetching
  });

  // Generate historical data points for the chart
  const rewardsHistory = useMemo(() => {
    if (!portfolio?.eth?.staked) {
      console.log('Missing required portfolio data:', portfolio?.eth);
      return [];
    }

    const points = [];
    const now = Date.now();
    const startTime = now - (60 * 60 * 1000); // Last hour
    const stakedTime = portfolio.eth.stakedAt ? new Date(portfolio.eth.stakedAt).getTime() : now - (24 * 60 * 60 * 1000);

    // Generate a point every 15 seconds for smoother visualization
    for (let time = startTime; time <= now; time += 15 * 1000) {
      const elapsedTime = (time - stakedTime) / 1000; // Convert to seconds
      if (elapsedTime <= 0) continue;

      // Calculate rewards based on 3% APY
      // (staked amount * APY * elapsed time in years)
      const yearsElapsed = elapsedTime / (365 * 24 * 60 * 60);
      const reward = portfolio.eth.staked * (0.03 * yearsElapsed);

      points.push({
        timestamp: time,
        rewards: reward
      });
    }

    return points;
  }, [portfolio?.eth?.staked, portfolio?.eth?.stakedAt]);

  // Memoize the derived data to prevent unnecessary re-renders
  const data = useMemo(() => ({
    totalStaked: portfolio?.eth?.staked ?? 0,
    rewards: portfolio?.eth?.rewards ?? 0,
    monthlyRewards: (portfolio?.eth?.staked ?? 0) * 0.03 / 12, // Calculate monthly rewards based on 3% APY
  }), [portfolio?.eth?.staked, portfolio?.eth?.rewards]);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Staking Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>Updates every 5 seconds</span>
              <span>•</span>
              <span>Last updated: {format(new Date(), 'HH:mm:ss')}</span>
            </div>
            <NotificationBell />
          </div>
        </div>

        <div className="grid gap-6">
          <StakingChart 
            data={rewardsHistory}
            totalStaked={data.totalStaked}
            currentRewards={data.rewards}
            isLoading={isLoading}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <StakingStats 
            totalStaked={data.totalStaked}
            rewards={data.rewards}
            monthlyRewards={data.monthlyRewards}
            isLoading={isLoading}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <StakingCard isLoading={isLoading} />
          <RewardsCalculator currentStake={data.totalStaked} />
        </div>
      </div>
    </div>
  );
}

export default memo(DashboardContent);