import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SiEthereum, SiSolana } from "react-icons/si";

interface PortfolioData {
  eth: {
    staked: number;
    rewards: number;
    apy: number;
  };
}

async function fetchPortfolioData(): Promise<PortfolioData> {
  const response = await fetch('/api/portfolio');
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio data');
  }
  return response.json();
}

export default function Portfolio() {
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['/api/portfolio'],
    queryFn: fetchPortfolioData,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 0 // Always consider data stale to force refresh
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Portfolio Overview</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* ETH Staking Card */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium text-white">
              <div className="flex items-center gap-2">
                <SiEthereum className="w-6 h-6" />
                Ethereum Staking
              </div>
            </CardTitle>
            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
              Active
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-[250px] bg-zinc-800" />
                <Skeleton className="h-4 w-[200px] bg-zinc-800" />
              </div>
            ) : portfolio ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-400">Total Staked</p>
                  <p className="text-2xl font-bold text-white">
                    {portfolio.eth.staked.toFixed(9)} ETH
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Total Rewards</p>
                  <p className="text-2xl font-bold text-green-500">
                    +{portfolio.eth.rewards.toFixed(9)} ETH
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Current APY</p>
                  <p className="text-lg text-purple-400">
                    {portfolio.eth.apy.toFixed(2)}%
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-zinc-400">Failed to load data</p>
            )}
          </CardContent>
        </Card>

        {/* SOL Staking Card (Coming Soon) */}
        <Card className="bg-zinc-900/50 border-zinc-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 text-lg py-2">
              Coming Soon
            </Badge>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium text-white">
              <div className="flex items-center gap-2">
                <SiSolana className="w-6 h-6" />
                Solana Staking
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-400">Estimated APY</p>
                <p className="text-2xl font-bold text-white">
                  6.50%
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Min. Stake</p>
                <p className="text-2xl font-bold text-white">
                  1.00 SOL
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
