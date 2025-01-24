import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RewardsCalculatorProps {
  currentStake?: number;
}

export function RewardsCalculator({ currentStake = 0 }: RewardsCalculatorProps) {
  const [stakeAmount, setStakeAmount] = useState(currentStake.toString());
  const [timeframe, setTimeframe] = useState("1");  // years
  const [compounding, setCompounding] = useState(false);
  const [rewards, setRewards] = useState({ normal: 0, compound: 0 });

  const calculateRewards = () => {
    const principal = parseFloat(stakeAmount) || 0;
    const years = parseInt(timeframe);
    const apy = 0.03; // 3% APY

    // Standard Staking Rewards (simple interest)
    const normalRewards = principal * apy * years;

    // Compound Staking Rewards (daily compounding)
    const compoundRewards = principal * Math.pow(1 + apy / 365, years * 365) - principal;

    setRewards({
      normal: normalRewards,
      compound: compoundRewards
    });
  };

  useEffect(() => {
    calculateRewards();
  }, [stakeAmount, timeframe, compounding]);

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Rewards Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stake-amount" className="text-zinc-400">Stake Amount (ETH)</Label>
          <Input
            id="stake-amount"
            type="number"
            min="0"
            step="0.01"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="0.00"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeframe" className="text-zinc-400">Time Period</Label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Year</SelectItem>
              <SelectItem value="2">2 Years</SelectItem>
              <SelectItem value="3">3 Years</SelectItem>
              <SelectItem value="5">5 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="compound"
            checked={compounding}
            onCheckedChange={setCompounding}
          />
          <Label htmlFor="compound" className="text-zinc-400">Enable Daily Compounding</Label>
        </div>

        <div className="pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Standard Rewards:</span>
            <span className="font-medium text-white">{rewards.normal.toFixed(6)} ETH</span>
          </div>
          {compounding && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Compound Rewards:</span>
                <span className="font-medium text-green-500">{rewards.compound.toFixed(6)} ETH</span>
              </div>
              <div className="flex justify-between items-center text-purple-500">
                <span className="text-sm">Additional Rewards from Compounding:</span>
                <span className="font-medium">
                  {(rewards.compound - rewards.normal).toFixed(6)} ETH
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}