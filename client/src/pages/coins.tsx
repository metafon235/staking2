import { AppLayout } from "@/components/layout/app-layout";
import CoinCard from "@/components/coins/CoinCard";
import { PivxIcon } from "@/components/icons/PivxIcon";

const AVAILABLE_COINS = {
  pivx: {
    name: "PIVX",
    symbol: "PIVX",
    apy: 10.00,
    minStake: "100",
    icon: PivxIcon,
    description: "PIVX staking enables you to earn passive income while supporting the network's security and decentralization.",
    enabled: true
  },
  // Add other coins here...
};

export default function CoinsOverview() {
  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Available Coins</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(AVAILABLE_COINS).map(([key, coin]) => (
              <CoinCard
                key={key}
                name={coin.name}
                symbol={coin.symbol}
                apy={coin.apy}
                minStake={coin.minStake}
                enabled={coin.enabled}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
