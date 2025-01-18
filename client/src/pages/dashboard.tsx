import StakingCard from "@/components/staking/StakingCard";
import StakingStats from "@/components/staking/StakingStats";
import RewardsChart from "@/components/staking/RewardsChart";
import { useQuery } from "@tanstack/react-query";
import { getStakingData } from "@/lib/web3";

export default function Dashboard() {
  const { data: stakingData } = useQuery({
    queryKey: ["/api/staking/data"],
    queryFn: getStakingData
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Staking Dashboard</h1>
      
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
