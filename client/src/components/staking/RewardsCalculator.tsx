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

    // Normal staking rewards (simple interest)
    const normalRewards = principal * apy * years;

    // Compound staking rewards (compound interest)
    // Assuming monthly compounding
    const compoundRewards = principal * Math.pow(1 + apy / 12, years * 12) - principal;

    setRewards({
      normal: normalRewards,
      compound: compoundRewards
    });
  };

  useEffect(() => {
    calculateRewards();
  }, [stakeAmount, timeframe, compounding]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rewards Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stake-amount">Stake Betrag (ETH)</Label>
          <Input
            id="stake-amount"
            type="number"
            min="0"
            step="0.01"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeframe">Zeitraum</Label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue placeholder="Wähle einen Zeitraum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Jahr</SelectItem>
              <SelectItem value="2">2 Jahre</SelectItem>
              <SelectItem value="3">3 Jahre</SelectItem>
              <SelectItem value="5">5 Jahre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="compound"
            checked={compounding}
            onCheckedChange={setCompounding}
          />
          <Label htmlFor="compound">Compounding aktivieren (monatlich)</Label>
        </div>

        <div className="pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Standard Rewards:</span>
            <span className="font-medium">{rewards.normal.toFixed(6)} ETH</span>
          </div>
          {compounding && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Compound Rewards:</span>
                <span className="font-medium">{rewards.compound.toFixed(6)} ETH</span>
              </div>
              <div className="flex justify-between items-center text-primary">
                <span className="text-sm">Zusätzliche Rewards durch Compounding:</span>
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
