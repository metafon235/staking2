import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface RewardsCalculatorProps {
  currentStake?: number;
}

export function RewardsCalculator({ currentStake = 0 }: RewardsCalculatorProps) {
  const [stakeAmount, setStakeAmount] = useState(currentStake.toString());
  const [timeframe, setTimeframe] = useState("1");  // years
  const [compounding, setCompounding] = useState(false);
  const [rewards, setRewards] = useState({ normal: 0, compound: 0 });

  const chartData = useMemo(() => {
    const data = [];
    const principal = parseFloat(stakeAmount) || 0;
    const years = parseInt(timeframe);
    const apy = 0.03; // 3% APY

    // Generate data points for each month
    for (let month = 0; month <= years * 12; month++) {
      const year = month / 12;

      // Calculate normal staking rewards
      const normalReward = principal * apy * year;

      // Calculate compound rewards (daily compounding)
      const compoundReward = principal * (Math.pow(1 + apy / 365, year * 365) - 1);

      data.push({
        month: month,
        normal: principal + normalReward,
        compound: principal + compoundReward,
      });
    }
    return data;
  }, [stakeAmount, timeframe]);

  useEffect(() => {
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
  }, [stakeAmount, timeframe, compounding]);

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-white">Rewards Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="stake-amount" className="text-sm text-zinc-400">Stake Amount (ETH)</Label>
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
            <Label htmlFor="timeframe" className="text-sm text-zinc-400">Time Period</Label>
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
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="compound"
            checked={compounding}
            onCheckedChange={setCompounding}
          />
          <Label htmlFor="compound" className="text-sm text-zinc-400">Enable Daily Compounding</Label>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="month" 
                stroke="#888" 
                tickFormatter={(value) => `${value}m`}
              />
              <YAxis 
                stroke="#888"
                tickFormatter={(value) => `${value.toFixed(2)} ETH`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                labelFormatter={(value) => `Month ${value}`}
                formatter={(value: number) => [`${value.toFixed(6)} ETH`]}
              />
              <Line 
                type="monotone" 
                dataKey="normal" 
                stroke="#8884d8" 
                name="Standard Staking"
                dot={false}
              />
              {compounding && (
                <Line 
                  type="monotone" 
                  dataKey="compound" 
                  stroke="#4ade80" 
                  name="Compound Staking"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 pt-2 border-t border-zinc-800">
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