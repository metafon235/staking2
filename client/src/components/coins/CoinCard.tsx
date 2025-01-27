import { Card, CardContent } from "@/components/ui/card";
import { type IconType } from "react-icons";
import { Button } from "@/components/ui/button";
import { PivxIcon } from "@/components/icons/PivxIcon";
import { useLocation } from "wouter";

interface CoinCardProps {
  name: string;
  symbol: string;
  apy: number;
  minStake: string;
  enabled?: boolean;
  onClick?: () => void;
  isAppView?: boolean;
}

export default function CoinCard({ 
  name, 
  symbol, 
  apy, 
  minStake, 
  enabled = true, 
  onClick,
  isAppView = false 
}: CoinCardProps) {
  const [location] = useLocation();

  return (
    <Card 
      className={`bg-zinc-900/50 ${enabled ? 'hover:bg-zinc-900/80' : 'opacity-50'} border-zinc-800 transition-all duration-300 cursor-pointer`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <PivxIcon className="w-8 h-8 text-purple-400" />
          <div className="px-3 py-1 text-xs rounded-full bg-zinc-800 text-zinc-400">
            {enabled ? "Available" : "Coming Soon"}
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

          <div className={`py-2 px-4 ${enabled ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-500'} rounded-lg text-center`}>
            {isAppView ? "Start Staking" : "View Details"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}