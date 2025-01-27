import { AppLayout } from "@/components/layout/app-layout";
import CoinCard from "@/components/coins/CoinCard";
import { COIN_DATA } from "@/config/coins";
import { useLocation } from "wouter";

export default function CoinsOverview() {
  const [, navigate] = useLocation();

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Available Coins</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(COIN_DATA).map(([key, coin]) => (
              <CoinCard
                key={key}
                name={coin.name}
                symbol={coin.symbol}
                apy={coin.apy}
                minStake={coin.minStake}
                enabled={coin.enabled}
                icon={coin.icon}
                isAppView={true}
                onClick={() => navigate(`/app/coins/${key}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}