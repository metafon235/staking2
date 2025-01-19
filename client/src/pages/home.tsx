import { Card } from "@/components/ui/card";
import CoinCard from "@/components/coins/CoinCard";
import { SiEthereum, SiPolkadot, SiSolana } from "react-icons/si";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Ethereum Staking Made Simple
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Start earning rewards with as little as 0.01 ETH. No technical knowledge required.
            Secure, transparent, and efficient staking platform.
          </p>
        </div>

        {/* Coin Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CoinCard
            name="Ethereum"
            symbol="ETH"
            apy={3.00}
            minStake="0.01"
            icon={SiEthereum}
            enabled={true}
          />
          <CoinCard
            name="Polkadot"
            symbol="DOT"
            apy={12.00}
            minStake="5.00"
            icon={SiPolkadot}
            enabled={false}
          />
          <CoinCard
            name="Solana"
            symbol="SOL"
            apy={6.50}
            minStake="1.00"
            icon={SiSolana}
            enabled={false}
          />
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <h3 className="text-xl font-semibold text-white mb-3">Secure Staking</h3>
            <p className="text-zinc-400">
              Your assets are protected by industry-leading security measures and regular audits.
            </p>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <h3 className="text-xl font-semibold text-white mb-3">Real-time Rewards</h3>
            <p className="text-zinc-400">
              Track your earnings in real-time with our advanced analytics dashboard.
            </p>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <h3 className="text-xl font-semibold text-white mb-3">Low Minimum</h3>
            <p className="text-zinc-400">
              Start with just 0.01 ETH and earn rewards proportional to your stake.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}