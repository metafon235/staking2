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
  pac: {
    name: "PAC",
    symbol: "PAC",
    apy: 8.50,
    minStake: "1000",
    icon: PivxIcon, // Temporarily using PIVX icon
    description: "PAC Protocol's staking mechanism rewards long-term holders while maintaining network security.",
    enabled: false
  },
  wagerr: {
    name: "WAGERR",
    symbol: "WGR",
    apy: 9.00,
    minStake: "250",
    icon: PivxIcon,
    description: "Wagerr's decentralized sports betting blockchain offers staking rewards to network validators.",
    enabled: false
  },
  crown: {
    name: "CROWN",
    symbol: "CRW",
    apy: 7.50,
    minStake: "500",
    icon: PivxIcon,
    description: "Crown platform's staking system provides sustainable returns while supporting the network infrastructure.",
    enabled: false
  },
  energi: {
    name: "ENERGI",
    symbol: "NRG",
    apy: 12.00,
    minStake: "100",
    icon: PivxIcon,
    description: "Energi's staking mechanism offers competitive returns while securing the smart contract platform.",
    enabled: false
  },
  defichain: {
    name: "DEFICHAIN",
    symbol: "DFI",
    apy: 15.00,
    minStake: "200",
    icon: PivxIcon,
    description: "DeFiChain staking supports the native DeFi platform while generating passive income.",
    enabled: false
  },
  firo: {
    name: "FIRO",
    symbol: "FIRO",
    apy: 11.00,
    minStake: "100",
    icon: PivxIcon,
    description: "Firo staking rewards participants while maintaining privacy-focused transaction processing.",
    enabled: false
  },
  gnosis: {
    name: "GNOSIS",
    symbol: "GNO",
    apy: 14.00,
    minStake: "1",
    icon: PivxIcon,
    description: "Gnosis Chain staking provides rewards for securing this Ethereum-compatible network.",
    enabled: false
  }
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