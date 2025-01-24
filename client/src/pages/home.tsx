import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Suspense, lazy, Component, ReactNode } from 'react';
import { SiEthereum, SiPolkadot, SiSolana } from "react-icons/si";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load components with explicit imports
const CoinCard = lazy(() => import('@/components/coins/CoinCard'));
const RewardsCalculator = lazy(() => import('@/components/staking/RewardsCalculator'));

// Error boundary component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6 bg-red-900/10 border-red-900/20">
          <p className="text-red-400">Something went wrong loading this component.</p>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Skeleton loader for coin cards
function CoinCardSkeleton() {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 p-6 space-y-4">
      <Skeleton className="h-12 w-12 rounded-full bg-zinc-800" />
      <Skeleton className="h-6 w-32 bg-zinc-800" />
      <Skeleton className="h-4 w-24 bg-zinc-800" />
      <Skeleton className="h-10 w-full bg-zinc-800" />
    </Card>
  );
}

// Memoized coin data to prevent unnecessary recalculations
const coinData = [
  {
    name: "Ethereum",
    symbol: "ETH",
    apy: 3.00,
    minStake: "0.01",
    icon: SiEthereum,
    enabled: true,
    route: "/coins/eth"
  },
  {
    name: "Polkadot",
    symbol: "DOT",
    apy: 12.00,
    minStake: "5.00",
    icon: SiPolkadot,
    enabled: false,
    route: "/coins/dot"
  },
  {
    name: "Solana",
    symbol: "SOL",
    apy: 6.50,
    minStake: "1.00",
    icon: SiSolana,
    enabled: false,
    route: "/coins/sol"
  }
] as const;

export default function Home() {
  const { user } = useUser();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Ethereum Staking Made Simple
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Start earning {coinData[0].apy}% APY with as little as {coinData[0].minStake} ETH. 
            No technical knowledge required.
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
          <ErrorBoundary>
            <Suspense fallback={
              <>
                <CoinCardSkeleton />
                <CoinCardSkeleton />
                <CoinCardSkeleton />
              </>
            }>
              {coinData.map((coin) => (
                <CoinCard
                  key={coin.symbol}
                  name={coin.name}
                  symbol={coin.symbol}
                  apy={coin.apy}
                  minStake={coin.minStake}
                  icon={coin.icon}
                  enabled={coin.enabled}
                  onClick={() => navigate(coin.route)}
                />
              ))}
            </Suspense>
          </ErrorBoundary>
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
              Start with just {coinData[0].minStake} ETH and earn rewards proportional to your stake.
            </p>
          </Card>
        </div>

        {/* Rewards Calculator Section */}
        <div className="mt-24">
          <ErrorBoundary>
            <Suspense fallback={
              <Card className="p-6">
                <Skeleton className="h-48 w-full bg-zinc-800" />
              </Card>
            }>
              <RewardsCalculator currentStake={0.01} />
            </Suspense>
          </ErrorBoundary>
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