import { Card, CardContent } from "@/components/ui/card";
import { type IconType } from "react-icons";
import { Button } from "@/components/ui/button";
import { PivxIcon } from "@/components/icons/PivxIcon";
import { useState } from "react";
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
  const [showWallet, setShowWallet] = useState(false);
  const [location] = useLocation();

  const handleClick = () => {
    if (isAppView && enabled) {
      setShowWallet(!showWallet);
    } else if (onClick) {
      onClick();
    }
  };

  const walletAddress = `${symbol.toLowerCase()}_stake_${Math.random().toString(36).substring(2, 15)}`;

  return (
    <Card 
      className={`bg-zinc-900/50 ${enabled ? 'hover:bg-[#9333EA] hover:border-purple-400' : 'opacity-50'} border-zinc-800 transition-all duration-300 cursor-pointer group`}
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <PivxIcon className="w-8 h-8 text-purple-400 group-hover:text-black transition-colors duration-300" />
          <div className="px-3 py-1 text-xs rounded-full bg-zinc-800 text-zinc-400 group-hover:bg-white/80 group-hover:text-black transition-colors duration-300">
            {enabled ? "Available" : "Coming Soon"}
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white group-hover:text-black transition-colors duration-300">{name}</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-3xl font-bold text-purple-400 group-hover:text-black transition-colors duration-300">{apy}% APY</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-zinc-400 group-hover:text-black/70 transition-colors duration-300">Minimum stake:</p>
            <p className="text-lg font-semibold text-white group-hover:text-black transition-colors duration-300">
              {minStake} {symbol}
            </p>
          </div>

          <div className={`py-2 px-4 ${enabled ? 'bg-purple-600 text-white group-hover:bg-white group-hover:text-black' : 'bg-zinc-800 text-zinc-500'} rounded-lg text-center transition-colors duration-300`}>
            {isAppView ? "Start Staking" : "View Details"}
          </div>

          {showWallet && enabled && isAppView && (
            <div className="mt-4 p-4 bg-zinc-800 group-hover:bg-white/10 rounded-lg transition-colors duration-300">
              <p className="text-sm text-zinc-400 group-hover:text-black mb-2 transition-colors duration-300">Send your {symbol} to this address to start staking:</p>
              <p className="text-xs text-white group-hover:text-black break-all font-mono transition-colors duration-300">{walletAddress}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}