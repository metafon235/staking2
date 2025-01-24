import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CoinCard from "@/components/coins/CoinCard";
import { SiEthereum, SiPolkadot, SiSolana } from "react-icons/si";
import { useUser } from "@/hooks/use-user";
import { useLocation, NavigateFunction } from "wouter";
import { RewardsCalculator } from "@/components/staking/RewardsCalculator";

export default function Home() {
  const { user } = useUser();
  const [, navigate] = useLocation() as [null, NavigateFunction];

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

          {/* CTA Section */}
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg"
                onClick={() => navigate("/auth")}
              >
                Start Staking Now
              </Button>
              <Button 
                variant="outline" 
                className="border-purple-600 text-purple-400 hover:bg-purple-600/10 px-8 py-6 text-lg"
                onClick={() => navigate("/auth")}
              >
                Login to Dashboard
              </Button>
            </div>
          )}
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
            onClick={() => navigate("/coins/eth")}
          />
          <CoinCard
            name="Polkadot"
            symbol="DOT"
            apy={12.00}
            minStake="5.00"
            icon={SiPolkadot}
            enabled={false}
            onClick={() => navigate("/coins/dot")}
          />
          <CoinCard
            name="Solana"
            symbol="SOL"
            apy={6.50}
            minStake="1.00"
            icon={SiSolana}
            enabled={false}
            onClick={() => navigate("/coins/sol")}
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

        {/* Rewards Calculator Section */}
        <div className="mt-24">
          <RewardsCalculator currentStake={100} />
        </div>

        {/* Bottom CTA Section */}
        {!user && (
          <div className="mt-24 text-center">
            <Card className="bg-gradient-to-r from-purple-900/50 to-purple-600/50 border-purple-500/20 p-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Earning?
              </h2>
              <p className="text-lg text-zinc-300 mb-8 max-w-2xl mx-auto">
                Join thousands of investors already earning passive income through our staking platform.
              </p>
              <Button 
                className="bg-white hover:bg-zinc-100 text-purple-600 px-8 py-6 text-lg"
                onClick={() => navigate("/auth")}
              >
                Create Free Account
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}