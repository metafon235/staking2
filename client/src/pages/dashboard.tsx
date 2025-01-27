import { format } from "date-fns";
import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import StakingCard from "@/components/staking/StakingCard";
import StakingChart from "@/components/staking/StakingChart";
import NotificationBell from "@/components/layout/NotificationBell";
import { RewardsCalculator } from "@/components/staking/RewardsCalculator";
import StakingStats from "@/components/staking/StakingStats";
import type { PortfolioResponse } from "@/lib/types";

function DashboardContent() {
  const { data: portfolioData, isLoading } = useQuery<PortfolioResponse>({
    queryKey: ['/api/portfolio'],
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 4000, // Consider data stale after 4 seconds
    retry: false,
    refetchOnWindowFocus: true,
    placeholderData: (previousData) => previousData, // Keep previous data while refetching
  });

  // Generate historical data points for the chart
  const rewardsHistory = useMemo(() => {
    if (!portfolioData?.pivx?.staked) {
      return [];
    }

    const points = [];
    const now = Date.now();
    const startTime = now - (60 * 60 * 1000); // Last hour
    const stakedTime = now - (24 * 60 * 60 * 1000); // Assume staked 24h ago if no timestamp

    // Generate a point every 15 seconds for smoother visualization
    for (let time = startTime; time <= now; time += 15 * 1000) {
      const elapsedTime = (time - stakedTime) / 1000; // Convert to seconds
      if (elapsedTime <= 0) continue;

      // Calculate rewards based on APY from the API
      const yearsElapsed = elapsedTime / (365 * 24 * 60 * 60);
      const apy = portfolioData?.pivx?.apy ?? 10; // Use API APY or fallback to 10%
      const reward = portfolioData.pivx.staked * ((apy / 100) * yearsElapsed);

      points.push({
        timestamp: time,
        rewards: reward
      });
    }

    return points;
  }, [portfolioData?.pivx?.staked, portfolioData?.pivx?.apy]);

  // Memoize the derived data to prevent unnecessary re-renders
  const data = useMemo(() => ({
    totalStaked: portfolioData?.pivx?.staked ?? 0,
    rewards: portfolioData?.pivx?.rewards ?? 0,
    monthlyRewards: (portfolioData?.pivx?.staked ?? 0) * ((portfolioData?.pivx?.apy ?? 10) / 100) / 12, // Calculate monthly rewards based on API APY
  }), [portfolioData?.pivx?.staked, portfolioData?.pivx?.rewards, portfolioData?.pivx?.apy]);

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