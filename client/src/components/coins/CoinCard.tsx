import { Card, CardContent } from "@/components/ui/card";
import { type IconType } from "react-icons";

interface CoinCardProps {
  name: string;
  symbol: string;
  apy: number;
  minStake: string;
  enabled?: boolean;
  icon: IconType;
  onClick?: () => void;
}

// Export as default for lazy loading
export default function CoinCard({ name, symbol, apy, minStake, enabled = true, icon: Icon, onClick }: CoinCardProps) {
  return (
    <Card 
      className={`bg-zinc-900/50 ${enabled ? 'hover:bg-zinc-900/80' : 'opacity-50'} border-zinc-800 transition-all duration-300 ${enabled ? 'cursor-pointer' : ''}`}
      onClick={enabled ? onClick : undefined}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Icon className="w-8 h-8 text-white" />
          <div className="px-3 py-1 text-xs rounded-full bg-zinc-800 text-zinc-400">
            Available for staking
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-3xl font-bold text-purple-400">{apy}% APY</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-zinc-400">Minimum stake:</p>
            <p className="text-lg font-semibold text-white">
              {minStake} {symbol}
            </p>
          </div>

          {enabled ? (
            <div className="py-2 px-4 bg-purple-600 text-white rounded-lg text-center">
              Start Staking
            </div>
          ) : (
            <div className="py-2 px-4 bg-zinc-800 text-zinc-500 rounded-lg text-center">
              Coming Soon
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}