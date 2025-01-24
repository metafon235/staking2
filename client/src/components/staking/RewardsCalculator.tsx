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

// Export as default for lazy loading
export default function RewardsCalculator({ currentStake = 0 }: RewardsCalculatorProps) {
  const [stakeAmount, setStakeAmount] = useState(currentStake.toString());
  const [timeframe, setTimeframe] = useState("1");  // years
  const [compounding, setCompounding] = useState(false);
  const [rewards, setRewards] = useState({ normal: 0, compound: 0 });

  const chartData = useMemo(() => {
    const data = [];
    const principal = parseFloat(stakeAmount) || 0;
    const years = parseInt(timeframe);
    const apy = 0.03; // 3% APY
    const compoundingApy = 0.035; // Enhanced APY for compound visualization

    // Generate data points for each month
    for (let month = 0; month <= years * 12; month++) {
      const year = month / 12;

      // Calculate normal staking rewards (linear growth)
      const normalReward = principal * apy * year;

      // Calculate compound rewards using enhanced APY for more dramatic effect
      const dailyRate = compoundingApy / 365;
      const days = year * 365;
      const compoundReward = principal * (Math.pow(1 + dailyRate, days) - 1);

      data.push({
        month: month,
        normal: parseFloat((principal + normalReward).toFixed(6)),
        compound: parseFloat((principal + compoundReward).toFixed(6))
      });
    }
    return data;
  }, [stakeAmount, timeframe]);

  useEffect(() => {
    const principal = parseFloat(stakeAmount) || 0;
    const years = parseInt(timeframe);
    const apy = 0.03; // 3% APY
    const compoundingApy = 0.035; // Enhanced APY for compound visualization

    // Standard Staking Rewards (simple interest)
    const normalRewards = principal * apy * years;

    // Compound Staking Rewards (daily compounding with enhanced APY)
    const dailyRate = compoundingApy / 365;
    const days = years * 365;
    const compoundRewards = principal * (Math.pow(1 + dailyRate, days) - 1);

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
            <LineChart 
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="month" 
                stroke="#888" 
                tickFormatter={(value) => `${value}m`}
                height={30}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#888"
                tickFormatter={(value) => `${value.toFixed(2)} ETH`}
                width={80}
                tick={{ fontSize: 12 }}
                domain={[
                  (dataMin: number) => Math.floor(dataMin),
                  (dataMax: number) => Math.ceil(dataMax * 1.1)
                ]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid #27272a',
                  padding: '8px',
                  fontSize: '12px'
                }}
                labelFormatter={(value) => `Month ${value}`}
                formatter={(value: number) => [`${value.toFixed(6)} ETH`]}
              />
              <Line 
                type="monotone" 
                dataKey="normal" 
                stroke="#8884d8" 
                name="Standard Staking"
                strokeWidth={2}
                dot={false}
              />
              {compounding && (
                <Line 
                  type="monotone" 
                  dataKey="compound" 
                  stroke="#4ade80" 
                  name="Compound Staking"
                  strokeWidth={3}
                  strokeOpacity={0.8}
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-zinc-400">Standard Rewards:</span>
            <span className="font-medium text-white">{rewards.normal.toFixed(6)} ETH</span>
          </div>
          {compounding && (
            <>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-zinc-400">Compound Rewards:</span>
                <span className="font-medium text-green-500">{rewards.compound.toFixed(6)} ETH</span>
              </div>
              <div className="flex justify-between items-center text-purple-500 py-1">
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