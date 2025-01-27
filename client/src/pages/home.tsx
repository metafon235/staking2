import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CoinCard from "@/components/coins/CoinCard";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { RewardsCalculator } from "@/components/staking/RewardsCalculator";
import { COIN_DATA } from "@/config/coins";
import { Shield, Server, Coins, Clock } from "lucide-react";

export default function Home() {
  const { user } = useUser();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Crypto Staking Made Simple
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Start earning passive crypto income without technical knowledge. 
            No expensive servers, no complex setup - just secure, transparent staking 
            with instant withdrawals.
          </p>

          {/* CTA Section */}
          {!user && (
            <div className="flex justify-center mb-16">
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg"
                onClick={() => navigate("/auth")}
              >
                Start Staking Now
              </Button>
            </div>
          )}
        </div>

        {/* Available Coins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {Object.entries(COIN_DATA).map(([key, coin]) => (
            <CoinCard
              key={key}
              name={coin.name}
              symbol={coin.symbol}
              apy={coin.apy}
              minStake={coin.minStake}
              enabled={coin.enabled}
              onClick={() => navigate(`/coins/${key}`)}
            />
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <div className="flex flex-col items-center text-center">
              <Shield className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">No Technical Knowledge</h3>
              <p className="text-zinc-400">
                Start staking instantly without any coding or technical expertise required.
              </p>
            </div>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <div className="flex flex-col items-center text-center">
              <Server className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">No Server Required</h3>
              <p className="text-zinc-400">
                We handle all the infrastructure. No need to run your own masternode servers.
              </p>
            </div>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <div className="flex flex-col items-center text-center">
              <Coins className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Low Minimums</h3>
              <p className="text-zinc-400">
                Start earning rewards with minimal investment. No expensive collateral needed.
              </p>
            </div>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800 p-6">
            <div className="flex flex-col items-center text-center">
              <Clock className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Instant Withdrawals</h3>
              <p className="text-zinc-400">
                Access your rewards anytime. No lockup periods - withdraw whenever you want.
              </p>
            </div>
          </Card>
        </div>

        {/* Rewards Calculator Section */}
        <div className="mt-24">
          <RewardsCalculator />
        </div>

        {/* Bottom CTA Section */}
        {!user && (
          <div className="mt-24 text-center">
            <Card className="bg-gradient-to-r from-purple-900/50 to-purple-600/50 border-purple-500/20 p-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Start Earning Passive Crypto Income Today
              </h2>
              <p className="text-lg text-zinc-300 mb-8 max-w-2xl mx-auto">
                Join thousands of investors already earning through our secure and simplified staking platform. 
                No technical expertise required - start earning in minutes.
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