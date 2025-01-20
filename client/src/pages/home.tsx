import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiEthereum, SiPolkadot, SiSolana } from "react-icons/si";

export default function Home() {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Blockchain Staking Platform
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ethereum Card */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <SiEthereum className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-xl font-semibold text-white">Ethereum</h3>
                <p className="text-blue-400">3.00% APY</p>
              </div>
            </div>
            <p className="text-zinc-400 mb-4">
              Stake ETH and earn rewards through Ethereum 2.0
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Stake ETH
            </Button>
          </Card>

          {/* Polkadot Card */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <SiPolkadot className="w-8 h-8 text-pink-400" />
              <div>
                <h3 className="text-xl font-semibold text-white">Polkadot</h3>
                <p className="text-pink-400">12.00% APY</p>
              </div>
            </div>
            <p className="text-zinc-400 mb-4">
              Secure the network and earn DOT rewards
            </p>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </Card>

          {/* Solana Card */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <SiSolana className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="text-xl font-semibold text-white">Solana</h3>
                <p className="text-green-400">6.50% APY</p>
              </div>
            </div>
            <p className="text-zinc-400 mb-4">
              Participate in Solana's proof-of-stake system
            </p>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}