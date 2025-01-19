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
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Staked</p>
            <h2 className="text-3xl font-bold">{totalStaked} ETH</h2>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Current Rewards</p>
            <h2 className="text-3xl font-bold">{rewards} ETH</h2>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Monthly Rewards</p>
            <h2 className="text-3xl font-bold">{monthlyRewards} ETH</h2>
          </div>
        </CardContent>
      </Card>
    </>
  );
}