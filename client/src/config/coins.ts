import { PivxIcon } from "@/components/icons/PivxIcon";
import type { IconType } from "react-icons";

export interface CoinConfig {
  name: string;
  symbol: string;
  apy: number;
  minStake: string;
  icon: IconType;
  description: string;
  enabled: boolean;
  technicalDetails: {
    consensus: string;
    blockTime: string;
    maxSupply: string;
    features: string[];
  };
  stakingDetails: {
    minStake: string;
    apy: number;
    lockupPeriod?: string;
    rewards: string;
  };
  documentation: Array<{
    question: string;
    answer: string;
  }>;
}

export const COIN_DATA: Record<string, CoinConfig> = {
  pivx: {
    name: "PIVX",
    symbol: "PIVX",
    apy: 10.00,
    minStake: "100",
    icon: PivxIcon,
    description: "PIVX Staking ermöglicht es Ihnen, passives Einkommen zu erzielen und gleichzeitig die Sicherheit und Dezentralisierung des Netzwerks zu unterstützen.",
    enabled: true,
    technicalDetails: {
      consensus: "Proof of Stake (PoS)",
      blockTime: "60 Sekunden",
      maxSupply: "21 Millionen PIVX",
      features: [
        "Schnelle Transaktionen",
        "Energieeffizientes PoS",
        "Datenschutz durch zk-SNARKs",
        "Dezentrale Governance",
        "Cold Staking Unterstützung"
      ]
    },
    stakingDetails: {
      minStake: "100",
      apy: 10.00,
      rewards: "Belohnungen werden alle 60 Sekunden verteilt und basieren auf der Größe Ihres Stakes und der Netzwerkaktivität."
    },
    documentation: [
      {
        question: "Was ist PIVX Staking?",
        answer: "PIVX Staking ist ein Prozess, bei dem Sie Ihre PIVX-Coins als Sicherheit hinterlegen, um das Netzwerk zu sichern und im Gegenzug Belohnungen zu erhalten."
      },
      {
        question: "Wie funktioniert der Staking-Prozess?",
        answer: "Sobald Sie den Mindestbetrag von 100 PIVX staken, nehmen Sie automatisch am Netzwerk-Konsens teil. Ihre Chance, einen Block zu validieren und Belohnungen zu erhalten, ist proportional zu Ihrem Stake."
      },
      {
        question: "Wie sicher ist PIVX Staking?",
        answer: "PIVX verwendet fortschrittliche Kryptographie und einen sicheren Proof-of-Stake-Mechanismus. Ihre Coins bleiben immer in Ihrer Kontrolle, und das Staking erfolgt über sichere Smart Contracts."
      }
    ]
  },
  pac: {
    name: "PAC",
    symbol: "PAC",
    apy: 8.50,
    minStake: "1000",
    icon: PivxIcon,
    description: "PAC Protocol ermöglicht dezentrales Staking mit Fokus auf Gemeinschaft und Nachhaltigkeit.",
    enabled: false,
    technicalDetails: {
      consensus: "Proof of Stake (PoS)",
      blockTime: "120 Sekunden",
      maxSupply: "100 Milliarden PAC",
      features: [
        "Community Governance",
        "Masternode System",
        "Schnelle Transaktionen",
        "Cross-Chain Kompatibilität"
      ]
    },
    stakingDetails: {
      minStake: "1000",
      apy: 8.50,
      rewards: "Staking-Belohnungen werden alle 120 Sekunden verteilt."
    },
    documentation: [
      {
        question: "Was macht PAC Protocol besonders?",
        answer: "PAC Protocol zeichnet sich durch sein einzigartiges Masternode-System und seine starke Community-Governance aus."
      }
    ]
  },
  // Weitere Coins hier...
};
