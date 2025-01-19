import { Card, CardContent } from "@/components/ui/card";

interface StakingStatsProps {
  totalStaked: number;
  rewards: number;
  monthlyRewards: number;
}

export default function StakingStats({
  totalStaked,
  rewards,
  monthlyRewards
}: StakingStatsProps) {
  return (
    <>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">Total Staked</p>
            <h2 className="text-3xl font-bold text-white">{totalStaked.toFixed(9)} ETH</h2>
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