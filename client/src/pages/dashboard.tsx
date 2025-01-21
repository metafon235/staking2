import StakingCard from "@/components/staking/StakingCard";
import StakingStats from "@/components/staking/StakingStats";
import StakingChart from "@/components/staking/StakingChart";
import { useQuery } from "@tanstack/react-query";
import NotificationBell from "@/components/layout/NotificationBell";
import { format } from "date-fns";
import { memo, useMemo } from "react";
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
    if (!portfolio?.eth?.staked || !portfolio?.eth?.stakedAt) {
      console.log('Missing required portfolio data');
      return [];
    }

    const points = [];
    const now = Date.now();
    const startTime = now - (60 * 60 * 1000); // Last hour
    const stakedTime = new Date(portfolio.eth.stakedAt).getTime();

    // Generate a point every 15 seconds for smoother visualization
    for (let time = startTime; time <= now; time += 15 * 1000) {
      const elapsedTime = time - stakedTime;
      if (elapsedTime <= 0) continue;

      const yearsElapsed = elapsedTime / (365 * 24 * 60 * 60 * 1000);
      const reward = portfolio.eth.staked * (0.03 * yearsElapsed); // 3% APY

      points.push({
        timestamp: time,
        rewards: reward
      });
    }

    console.log('Generated points:', points.length, 'Sample:', points[0]); // Debug log
    return points;
  }, [portfolio?.eth?.staked, portfolio?.eth?.stakedAt]);

  // Memoize the derived data to prevent unnecessary re-renders
  const data = useMemo(() => ({
    totalStaked: portfolio?.eth?.staked ?? 0,
    rewards: portfolio?.eth?.rewards ?? 0,
    monthlyRewards: (portfolio?.eth?.staked ?? 0) * 0.03 / 12, // Calculate monthly rewards based on 3% APY
    rewardsHistory
  }), [portfolio?.eth?.staked, portfolio?.eth?.rewards, rewardsHistory]);

  console.log('Chart data:', data.rewardsHistory.length); // Debug log

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
            data={data.rewardsHistory}
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

        <div className="grid gap-6">
          <StakingCard isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export default memo(DashboardContent);