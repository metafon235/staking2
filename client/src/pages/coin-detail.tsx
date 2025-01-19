import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { SiEthereum, SiPolkadot, SiSolana } from "react-icons/si";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";

const COIN_DATA = {
  eth: {
    name: "Ethereum",
    symbol: "ETH",
    apy: 3.00,
    minStake: "0.01",
    icon: SiEthereum,
    description: "Ethereum 2.0 staking enables you to earn rewards by participating in network validation.",
    enabled: true
  },
  dot: {
    name: "Polkadot",
    symbol: "DOT",
    apy: 12.00,
    minStake: "5.00",
    icon: SiPolkadot,
    description: "Stake DOT to secure the network and earn rewards through Polkadot's nominated proof-of-stake system.",
    enabled: false
  },
  sol: {
    name: "Solana",
    symbol: "SOL",
    apy: 6.50,
    minStake: "1.00",
    icon: SiSolana,
    description: "Participate in Solana's proof-of-stake consensus mechanism to earn staking rewards.",
    enabled: false
  }
};

export default function CoinDetail() {
  const { symbol } = useParams();
  const [stakeAmount, setStakeAmount] = useState("");
  const { user } = useUser();
  const [, navigate] = useLocation();

  const coinData = COIN_DATA[symbol as keyof typeof COIN_DATA];

  if (!coinData) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Coin not found</h1>
        </div>
      </div>
    );
  }

  const Icon = coinData.icon;
  const monthlyReward = parseFloat(stakeAmount || "0") * (coinData.apy / 12 / 100);
  const yearlyReward = parseFloat(stakeAmount || "0") * (coinData.apy / 100);

  const handleStartStaking = () => {
    if (!user) {
      navigate("/auth");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Icon className="w-12 h-12 text-white" />
          <h1 className="text-4xl font-bold text-white">{coinData.name} Staking</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Staking Information */}
          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-zinc-400">{coinData.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-400">Annual Percentage Yield</p>
                    <p className="text-2xl font-bold text-purple-400">{coinData.apy}% APY</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Minimum Stake</p>
                    <p className="text-2xl font-bold text-white">
                      {coinData.minStake} {coinData.symbol}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Rewards Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">
                    Amount to stake ({coinData.symbol})
                  </label>
                  <Input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    min={coinData.minStake}
                    step="0.01"
                    placeholder={`Min. ${coinData.minStake} ${coinData.symbol}`}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-400">Monthly Rewards</p>
                    <p className="text-2xl font-bold text-white">
                      {monthlyReward.toFixed(6)} {coinData.symbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Yearly Rewards</p>
                    <p className="text-2xl font-bold text-white">
                      {yearlyReward.toFixed(6)} {coinData.symbol}
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handleStartStaking}
                  disabled={!coinData.enabled}
                >
                  {coinData.enabled ? "Start Staking" : "Coming Soon"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Statistics and Charts */}
          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Network Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-400">Total Value Locked</p>
                    <p className="text-2xl font-bold text-white">Coming Soon</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Active Validators</p>
                    <p className="text-2xl font-bold text-white">Coming Soon</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Average Stake Size</p>
                    <p className="text-2xl font-bold text-white">Coming Soon</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Total Stakers</p>
                    <p className="text-2xl font-bold text-white">Coming Soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Historical Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-zinc-400">
                  Chart coming soon
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
