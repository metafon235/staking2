import { format } from "date-fns";
import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import StakingCard from "@/components/staking/StakingCard";
import StakingChart from "@/components/staking/StakingChart";
import NotificationBell from "@/components/layout/NotificationBell";
import { RewardsCalculator } from "@/components/staking/RewardsCalculator";
import StakingStats from "@/components/staking/StakingStats";
import type { PortfolioResponse } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

function DashboardContent() {
  const { toast } = useToast();

  const { data: portfolioData, isLoading, error } = useQuery<PortfolioResponse>({
    queryKey: ['/api/portfolio'],
    refetchInterval: 5000,
    onError: (error) => {
      console.error('Portfolio fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolio data. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Generate historical data points for the chart
  const rewardsHistory = useMemo(() => {
    if (!portfolioData?.pivx?.staked) {
      return [];
    }

    const points = [];
    const now = Date.now();
    const startTime = now - (60 * 60 * 1000); // Last hour
    const stakedTime = now - (24 * 60 * 60 * 1000); // Assume staked 24h ago

    for (let time = startTime; time <= now; time += 15 * 1000) {
      const elapsedTime = (time - stakedTime) / 1000;
      if (elapsedTime <= 0) continue;

      const yearsElapsed = elapsedTime / (365 * 24 * 60 * 60);
      const apy = portfolioData.pivx.apy;
      const reward = portfolioData.pivx.staked * ((apy / 100) * yearsElapsed);

      points.push({
        timestamp: time,
        rewards: parseFloat(reward.toFixed(9)),
      });
    }

    return points;
  }, [portfolioData?.pivx?.staked, portfolioData?.pivx?.apy]);

  const data = useMemo(() => {
    const totalStaked = portfolioData?.pivx?.staked ?? 0;
    const rewards = portfolioData?.pivx?.rewards ?? 0;
    const apy = portfolioData?.pivx?.apy ?? 10;
    const monthlyRewards = totalStaked * (apy / 100) / 12;

    return {
      totalStaked,
      rewards,
      monthlyRewards,
    };
  }, [portfolioData?.pivx?.staked, portfolioData?.pivx?.rewards, portfolioData?.pivx?.apy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Staking Dashboard</h1>
          </div>
          <div className="grid gap-6">
            <StakingChart 
              data={[]}
              totalStaked={0}
              currentRewards={0}
              isLoading={true}
            />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <StakingStats 
              totalStaked={0}
              rewards={0}
              monthlyRewards={0}
              isLoading={true}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-red-500">
            Failed to load portfolio data. Please try refreshing the page.
          </div>
        </div>
      </div>
    );
  }

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
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <StakingStats 
            totalStaked={data.totalStaked}
            rewards={data.rewards}
            monthlyRewards={data.monthlyRewards}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <StakingCard />
          <RewardsCalculator currentStake={data.totalStaked} />
        </div>
      </div>
    </div>
  );
}

export default memo(DashboardContent);