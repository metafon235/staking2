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
      rewards: "PAC Staking-Belohnungen werden alle 120 Sekunden verteilt und durch das Masternode-System zusätzlich verstärkt."
    },
    documentation: [
      {
        question: "Was macht PAC Protocol besonders?",
        answer: "PAC Protocol zeichnet sich durch sein einzigartiges Masternode-System und seine starke Community-Governance aus."
      },
      {
        question: "Wie funktioniert das PAC Masternode-System?",
        answer: "Masternodes erfordern einen höheren Stake und bieten zusätzliche Belohnungen für Netzwerk-Dienste wie InstantSend und PrivateSend."
      }
    ]
  },
  wagerr: {
    name: "WAGERR",
    symbol: "WGR",
    apy: 9.00,
    minStake: "250",
    icon: PivxIcon,
    description: "Wagerr ermöglicht dezentrales Sportwetten und Staking mit attraktiven Renditen.",
    enabled: false,
    technicalDetails: {
      consensus: "Proof of Stake (PoS)",
      blockTime: "60 Sekunden",
      maxSupply: "200 Millionen WGR",
      features: [
        "Dezentrales Sportwetten",
        "Oracle-Masternodes",
        "Automatische Gewinnausschüttung",
        "Deflationäres Tokenmodell"
      ]
    },
    stakingDetails: {
      minStake: "250",
      apy: 9.00,
      rewards: "WGR Staking kombiniert PoS-Belohnungen mit Gebühren aus der Sportwetten-Plattform."
    },
    documentation: [
      {
        question: "Wie verbindet Wagerr Staking und Sportwetten?",
        answer: "Wagerr nutzt Staking zur Netzwerksicherung, während Wettgebühren teilweise an Staker ausgeschüttet werden."
      },
      {
        question: "Was sind Oracle-Masternodes?",
        answer: "Oracle-Masternodes sind spezialisierte Netzwerkknoten, die Sportergebnisse validieren und Smart Contracts auslösen."
      }
    ]
  },
  crown: {
    name: "CROWN",
    symbol: "CRW",
    apy: 7.50,
    minStake: "500",
    icon: PivxIcon,
    description: "Crown bietet eine innovative Blockchain-Infrastruktur mit nachhaltigem Staking-Modell.",
    enabled: false,
    technicalDetails: {
      consensus: "Proof of Stake (PoS)",
      blockTime: "60 Sekunden",
      maxSupply: "42 Millionen CRW",
      features: [
        "Systemnode Netzwerk",
        "NFT Unterstützung",
        "Cross-Chain Bridge",
        "Governance System"
      ]
    },
    stakingDetails: {
      minStake: "500",
      apy: 7.50,
      rewards: "Crown verteilt Staking-Belohnungen basierend auf einem dynamischen Belohnungsmodell."
    },
    documentation: [
      {
        question: "Was sind Crown Systemnodes?",
        answer: "Systemnodes sind spezielle Netzwerkknoten, die erweiterte Dienste bereitstellen und höhere Belohnungen erhalten."
      },
      {
        question: "Wie funktioniert Crown's Governance?",
        answer: "Staker können über Netzwerkänderungen und Entwicklungsvorschläge abstimmen."
      }
    ]
  },
  energi: {
    name: "ENERGI",
    symbol: "NRG",
    apy: 12.00,
    minStake: "100",
    icon: PivxIcon,
    description: "Energi verbindet Smart Contracts mit Proof of Stake für maximale Skalierbarkeit.",
    enabled: false,
    technicalDetails: {
      consensus: "Proof of Stake (PoS)",
      blockTime: "30 Sekunden",
      maxSupply: "Unbegrenzt",
      features: [
        "Layer-2 Skalierung",
        "Smart Contracts",
        "Governance System",
        "Selbstfinanziertes Treasury"
      ]
    },
    stakingDetails: {
      minStake: "100",
      apy: 12.00,
      rewards: "Energi bietet eine der höchsten Staking-Renditen im Krypto-Sektor."
    },
    documentation: [
      {
        question: "Wie unterscheidet sich Energi von anderen PoS-Coins?",
        answer: "Energi kombiniert hohe Staking-Renditen mit Smart Contract-Funktionalität und Layer-2-Skalierung."
      },
      {
        question: "Was ist das Energi Treasury System?",
        answer: "Ein Teil der Blockbelohnungen fließt in ein Treasury für Entwicklung und Marketing."
      }
    ]
  },
  defichain: {
    name: "DEFICHAIN",
    symbol: "DFI",
    apy: 15.00,
    minStake: "200",
    icon: PivxIcon,
    description: "DeFiChain ist die Blockchain für dezentralisierte Finanzanwendungen.",
    enabled: false,
    technicalDetails: {
      consensus: "Proof of Stake (PoS)",
      blockTime: "30 Sekunden",
      maxSupply: "1.2 Milliarden DFI",
      features: [
        "DeFi-fokussierte Chain",
        "Bitcoin-Ankerkette",
        "Dezentrale Assets",
        "Liquiditätsmining"
      ]
    },
    stakingDetails: {
      minStake: "200",
      apy: 15.00,
      rewards: "DeFiChain kombiniert Staking-Belohnungen mit DeFi-Erträgen."
    },
    documentation: [
      {
        question: "Was macht DeFiChain einzigartig?",
        answer: "DeFiChain ist speziell für DeFi-Anwendungen optimiert und an Bitcoin verankert."
      },
      {
        question: "Wie funktioniert das Liquiditätsmining?",
        answer: "Neben Staking können Sie auch Liquidität bereitstellen und zusätzliche Belohnungen verdienen."
      }
    ]
  },
  firo: {
    name: "FIRO",
    symbol: "FIRO",
    apy: 11.00,
    minStake: "100",
    icon: PivxIcon,
    description: "Firo (früher Zcoin) ist führend in Blockchain-Datenschutztechnologie.",
    enabled: false,
    technicalDetails: {
      consensus: "FiroPoS",
      blockTime: "5 Minuten",
      maxSupply: "21.4 Millionen FIRO",
      features: [
        "Lelantus Datenschutz",
        "Spark Protokoll",
        "Schnelle Transaktionen",
        "LLMQ ChainLocks"
      ]
    },
    stakingDetails: {
      minStake: "100",
      apy: 11.00,
      rewards: "Firo belohnt Staker für die Sicherung des Privacy-fokussierten Netzwerks."
    },
    documentation: [
      {
        question: "Was ist Lelantus?",
        answer: "Lelantus ist Firos proprietäre Datenschutztechnologie für anonyme Transaktionen."
      },
      {
        question: "Wie sicher ist Firo Staking?",
        answer: "Firo verwendet ChainLocks und einen einzigartigen PoS-Mechanismus für maximale Sicherheit."
      }
    ]
  },
  gnosis: {
    name: "GNOSIS",
    symbol: "GNO",
    apy: 14.00,
    minStake: "1",
    icon: PivxIcon,
    description: "Gnosis Chain ist eine Ethereum-kompatible Blockchain mit schnellen, günstigen Transaktionen.",
    enabled: false,
    technicalDetails: {
      consensus: "POSDAO",
      blockTime: "5 Sekunden",
      maxSupply: "10 Millionen GNO",
      features: [
        "EVM Kompatibilität",
        "Layer-1 Skalierung",
        "Niedrige Gebühren",
        "Brücke zu Ethereum"
      ]
    },
    stakingDetails: {
      minStake: "1",
      apy: 14.00,
      rewards: "Gnosis Chain Validatoren erhalten Belohnungen für die Blockproduktion und Transaktionsgebühren."
    },
    documentation: [
      {
        question: "Was ist POSDAO?",
        answer: "POSDAO ist ein neuartiger Konsensalgorithmus, der Delegated Proof of Stake mit einer DAO kombiniert."
      },
      {
        question: "Wie funktioniert die Ethereum-Kompatibilität?",
        answer: "Gnosis Chain unterstützt alle Ethereum-Tools und -Smart Contracts bei deutlich niedrigeren Gebühren."
      }
    ]
  }
};