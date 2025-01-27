import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from "recharts";
import { COIN_DATA } from "@/config/coins";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RewardsCalculatorProps {
  currentStake?: number;
}

export function RewardsCalculator({ currentStake = 0 }: RewardsCalculatorProps) {
  const [stakeAmount, setStakeAmount] = useState(currentStake.toString());
  const [timeframe, setTimeframe] = useState("1");  // years
  const [compounding, setCompounding] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState("pivx");
  const [rewards, setRewards] = useState({ normal: 0, compound: 0 });
  const [error, setError] = useState<string | null>(null);

  // Get APY for selected coin
  const selectedCoinData = COIN_DATA[selectedCoin];
  const APY = (selectedCoinData?.apy || 0) / 100; // Convert percentage to decimal
  const DAYS_PER_YEAR = 365;

  // Validate stake amount against minimum requirement
  useEffect(() => {
    const amount = parseFloat(stakeAmount);
    const minStake = parseFloat(selectedCoinData?.minStake || "0");

    if (amount && amount < minStake) {
      setError(`Minimum stake required is ${minStake} ${selectedCoinData?.symbol}`);
    } else {
      setError(null);
    }
  }, [stakeAmount, selectedCoin]);

  // Calculate compound interest using standard formula
  // FV = P(1 + r/n)^(n*t)
  const calculateCompoundInterest = (principal: number, years: number) => {
    const r = APY;
    const n = DAYS_PER_YEAR; // Compounding frequency (daily)
    const t = years;

    const futureValue = principal * Math.pow(1 + r/n, n * t);
    return futureValue - principal;
  };

  // Calculate simple interest (no compounding)
  const calculateSimpleInterest = (principal: number, years: number) => {
    return principal * APY * years;
  };

  const chartData = useMemo(() => {
    const data = [];
    const principal = parseFloat(stakeAmount) || 0;
    const maxYears = parseInt(timeframe);
    const POINTS_PER_YEAR = 12; // Monthly data points for visualization

    for (let month = 0; month <= maxYears * POINTS_PER_YEAR; month++) {
      const years = month / POINTS_PER_YEAR;
      const normalReward = calculateSimpleInterest(principal, years);
      const compoundReward = calculateCompoundInterest(principal, years);

      data.push({
        month: month,
        normal: parseFloat(normalReward.toFixed(6)),
        compound: parseFloat(compoundReward.toFixed(6))
      });
    }

    return data;
  }, [stakeAmount, timeframe, APY]);

  useEffect(() => {
    const principal = parseFloat(stakeAmount) || 0;
    const years = parseInt(timeframe);

    const normalRewards = calculateSimpleInterest(principal, years);
    const compoundRewards = calculateCompoundInterest(principal, years);

    setRewards({
      normal: normalRewards,
      compound: compoundRewards
    });
  }, [stakeAmount, timeframe, compounding, APY]);

  const percentageIncrease = rewards.normal > 0 
    ? ((rewards.compound - rewards.normal) / rewards.normal * 100).toFixed(2)
    : '0';

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-white">Rewards Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Coin Selection */}
          <div className="space-y-2">
            <Label htmlFor="coin-select" className="text-sm text-zinc-400">Select Coin</Label>
            <Select value={selectedCoin} onValueChange={setSelectedCoin}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select coin" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COIN_DATA).map(([key, data]) => (
                  <SelectItem key={key} value={key}>
                    {data.name} ({data.symbol}) - {data.apy}% APY
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stake Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="stake-amount" className="text-sm text-zinc-400">
              Stake Amount ({selectedCoinData?.symbol})
            </Label>
            <Input
              id="stake-amount"
              type="number"
              min="0"
              step="0.000001"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="0"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          {/* Time Period Selection */}
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
                <SelectItem value="10">10 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Coin Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-800/50 rounded-lg">
          <div>
            <p className="text-sm text-zinc-400">Annual Return (APY)</p>
            <p className="text-xl font-bold text-purple-400">{selectedCoinData?.apy}%</p>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Minimum Stake</p>
            <p className="text-xl font-bold text-white">
              {selectedCoinData?.minStake} {selectedCoinData?.symbol}
            </p>
          </div>
        </div>

        {/* Compounding Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="compound"
            checked={compounding}
            onCheckedChange={setCompounding}
          />
          <Label htmlFor="compound" className="text-sm text-zinc-400">Enable Daily Compounding</Label>
        </div>

        {/* Chart */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData}
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <defs>
                <linearGradient id="compoundGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="month" 
                stroke="#888" 
                tickFormatter={(value) => `${Math.floor(value/12)}y ${value%12}m`}
                height={30}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#888"
                tickFormatter={(value) => `${value.toFixed(6)}`}
                width={55}
                tick={{ fontSize: 12 }}
                domain={[
                  0,
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
                labelFormatter={(value) => `${Math.floor(value/12)}y ${value%12}m`}
                formatter={(value: number) => [
                  `${value.toFixed(6)} ${selectedCoinData?.symbol}`
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="normal" 
                stroke="#8884d8" 
                name="Standard Rewards"
                strokeWidth={2}
                dot={false}
                strokeOpacity={0.6}
              />
              {compounding && (
                <>
                  <Area
                    type="monotone"
                    dataKey="compound"
                    stroke="#4ade80"
                    fill="url(#compoundGradient)"
                    fillOpacity={1}
                    strokeWidth={0}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="compound" 
                    stroke="#4ade80" 
                    name="Compound Rewards"
                    strokeWidth={3}
                    dot={false}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-zinc-800">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400 whitespace-nowrap">Standard Rewards:</span>
            <span className="font-medium text-white tabular-nums">
              {rewards.normal.toFixed(6)} {selectedCoinData?.symbol}
            </span>
          </div>
          {compounding && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400 whitespace-nowrap">Compound Rewards:</span>
                <span className="font-medium text-green-500 tabular-nums">
                  {rewards.compound.toFixed(6)} {selectedCoinData?.symbol}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-500 whitespace-nowrap">Additional from Compounding:</span>
                <span className="font-medium text-purple-500 tabular-nums">
                  +{(rewards.compound - rewards.normal).toFixed(6)} {selectedCoinData?.symbol} ({percentageIncrease}% more)
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}