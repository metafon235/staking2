import { PivxIcon } from "@/components/icons/PivxIcon";
import type { IconType } from "react-icons";
import { 
  SiBitcoin,
  SiLitecoin,
  SiDogecoin,
  SiEthereum,
  SiBinance
} from "react-icons/si";
import {
  FaCoins
} from "react-icons/fa";

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
    description: "PIVX Staking represents a cutting-edge Proof of Stake (PoS) blockchain investment opportunity. As a leading privacy-focused cryptocurrency, PIVX combines sophisticated staking mechanisms with advanced privacy features, allowing investors to earn consistent passive income while supporting network security. With its energy-efficient consensus mechanism and robust governance system, PIVX staking offers an environmentally conscious and democratized approach to cryptocurrency earnings.",
    enabled: true,
    technicalDetails: {
      consensus: "Proof of Stake (PoS)",
      blockTime: "60 seconds",
      maxSupply: "21 million PIVX",
      features: [
        "Fast Transactions with 60-second block times",
        "Energy-efficient Proof of Stake consensus",
        "Advanced privacy through zk-SNARKs technology",
        "Decentralized Governance with community voting",
        "Cold Staking Support for enhanced security",
        "Custom Shield Protocol for private transactions",
        "Dynamic block rewards distribution",
        "Masternode support for network stability"
      ]
    },
    stakingDetails: {
      minStake: "100",
      apy: 10.00,
      rewards: "PIVX staking rewards are distributed every 60 seconds through a dynamic reward system. Stakers earn consistent returns based on their stake size, network participation, and overall network activity. The reward structure incentivizes long-term holding and network security participation."
    },
    documentation: [
      {
        question: "What is PIVX Staking and how does it work?",
        answer: "PIVX Staking is a process where you lock your PIVX coins to participate in the network's consensus mechanism. By staking PIVX, you help validate transactions and secure the network, earning rewards in return. The staking process is energy-efficient and requires no specialized hardware, making it accessible to all investors."
      },
      {
        question: "How do I start staking PIVX?",
        answer: "To begin staking PIVX, you need a minimum of 100 PIVX coins. Once you have the minimum amount, you can start staking through our platform. The process is straightforward: deposit your PIVX to your staking wallet, and your coins will automatically begin participating in the network consensus, generating rewards based on your stake size."
      },
      {
        question: "What makes PIVX staking unique?",
        answer: "PIVX staking stands out due to its combination of privacy features, low entry barrier, and consistent reward structure. Unlike other staking platforms, PIVX offers cold staking capabilities, allowing you to stake while keeping your coins in cold storage for enhanced security. The network also features a unique shield protocol for private transactions."
      },
      {
        question: "What are the benefits of PIVX staking?",
        answer: "PIVX staking offers multiple benefits: competitive 10% APY returns, regular reward distributions every 60 seconds, enhanced privacy features, and participation in network governance. Stakers can also benefit from potential value appreciation while supporting a sustainable and energy-efficient blockchain network."
      },
      {
        question: "How secure is PIVX staking?",
        answer: "PIVX staking employs advanced cryptographic techniques and a secure Proof-of-Stake mechanism. The platform supports cold staking, allowing you to stake while keeping your coins in secure cold storage. Additionally, the network's shield protocol and zk-SNARKs technology ensure transaction privacy and security."
      }
    ]
  },
  pac: {
    name: "PAC",
    symbol: "PAC",
    apy: 25.00,
    minStake: "1000",
    icon: FaCoins,
    description: "PAC Protocol staking introduces a revolutionary approach to cryptocurrency yield generation through its advanced masternode and staking system. Built on a foundation of community-driven development and sustainable tokenomics, PAC staking offers investors a reliable way to earn passive income while contributing to a robust, decentralized network infrastructure. The platform combines traditional staking benefits with innovative features designed for long-term value creation.",
    enabled: false,
    technicalDetails: {
      consensus: "Proof of Stake (PoS)",
      blockTime: "120 seconds",
      maxSupply: "100 billion PAC",
      features: [
        "Decentralized Community Governance",
        "Advanced Masternode Infrastructure",
        "High-speed Transaction Processing",
        "Cross-Chain Integration Capabilities",
        "Deterministic Masternode Lists",
        "Instant Transaction Confirmations",
        "Multi-tier Staking System",
        "Enhanced Network Security"
      ]
    },
    stakingDetails: {
      minStake: "1000",
      apy: 25.00,
      rewards: "PAC staking implements a dual reward system combining regular staking returns with masternode rewards. The platform distributes rewards every 120 seconds, with additional benefits for masternode operators who provide essential network services."
    },
    documentation: [
      {
        question: "What are the unique features of PAC staking?",
        answer: "PAC staking combines traditional proof-of-stake rewards with an advanced masternode system. This dual approach provides multiple revenue streams for participants while ensuring network stability and security. The platform's unique features include instant transactions, cross-chain compatibility, and a community-driven governance system."
      },
      {
        question: "How does PAC's masternode system enhance staking?",
        answer: "PAC's masternode system works alongside regular staking to provide additional network services and rewards. Masternode operators earn higher rewards for providing services like InstantSend and PrivateSend, while also participating in network governance decisions. This creates a more robust and feature-rich ecosystem."
      },
      {
        question: "What are the benefits of PAC Protocol staking?",
        answer: "PAC Protocol staking offers several advantages: competitive 25% APY returns, potential masternode earnings, participation in network governance, and exposure to a growing cross-chain ecosystem. Stakers benefit from regular reward distributions and can participate in network development decisions."
      },
      {
        question: "How does PAC ensure network security?",
        answer: "PAC maintains network security through a combination of proof-of-stake consensus and masternode verification. The system uses deterministic masternode lists and requires significant collateral for masternode operation, ensuring network participants have a vested interest in maintaining security."
      },
      {
        question: "What makes PAC Protocol's governance unique?",
        answer: "PAC Protocol features a comprehensive governance system where both stakers and masternode operators can participate in decision-making. This includes voting on development proposals, protocol upgrades, and network parameters, ensuring a truly decentralized ecosystem."
      }
    ]
  },
  wagerr: {
    name: "WAGERR",
    symbol: "WGR",
    apy: 134.00,
    minStake: "250",
    icon: PivxIcon,
    description: "Wagerr enables decentralized sports betting and staking with attractive returns.",
    enabled: false,
    technicalDetails: {
      consensus: "Proof of Stake (PoS)",
      blockTime: "60 seconds",
      maxSupply: "200 million WGR",
      features: [
        "Decentralized Sports Betting",
        "Oracle Masternodes",
        "Automatic Payout of Winnings",
        "Deflationary Token Model"
      ]
    },
    stakingDetails: {
      minStake: "250",
      apy: 134.00,
      rewards: "WGR staking combines high PoS rewards with fees from the sports betting platform."
    },
    documentation: [
      {
        question: "How does Wagerr connect staking and sports betting?",
        answer: "Wagerr uses staking to secure the network, while betting fees are partially distributed to stakers."
      },
      {
        question: "What are Oracle Masternodes?",
        answer: "Oracle Masternodes are specialized network nodes that validate sports results and trigger smart contracts."
      }
    ]
  },
  crown: {
    name: "CROWN",
    symbol: "CRW",
    apy: 211.00,
    minStake: "500",
    icon: SiBitcoin,
    description: "Crown offers an innovative blockchain infrastructure with a sustainable staking model.",
    enabled: false,
    technicalDetails: {
      consensus: "Proof of Stake (PoS)",
      blockTime: "60 seconds",
      maxSupply: "42 million CRW",
      features: [
        "Systemnode Network",
        "NFT Support",
        "Cross-Chain Bridge",
        "Governance System"
      ]
    },
    stakingDetails: {
      minStake: "500",
      apy: 211.00,
      rewards: "Crown distributes staking rewards based on a dynamic reward model with extremely high returns."
    },
    documentation: [
      {
        question: "What are Crown Systemnodes?",
        answer: "Systemnodes are special network nodes that provide enhanced services and receive higher rewards."
      },
      {
        question: "How does Crown's Governance work?",
        answer: "Stakers can vote on network changes and development proposals."
      }
    ]
  },
  energi: {
    name: "ENERGI",
    symbol: "NRG",
    apy: 15.00,
    minStake: "100",
    icon: PivxIcon,
    description: "Energi combines smart contracts with Proof of Stake for maximum scalability.",
    enabled: false,
    technicalDetails: {
      consensus: "Proof of Stake (PoS)",
      blockTime: "30 seconds",
      maxSupply: "Unlimited",
      features: [
        "Layer-2 Scaling",
        "Smart Contracts",
        "Governance System",
        "Self-Funded Treasury"
      ]
    },
    stakingDetails: {
      minStake: "100",
      apy: 15.00,
      rewards: "Energi offers competitive staking yields in the crypto sector."
    },
    documentation: [
      {
        question: "How does Energi differ from other PoS coins?",
        answer: "Energi combines sustainable staking yields with smart contract functionality and Layer-2 scaling."
      },
      {
        question: "What is the Energi Treasury System?",
        answer: "A portion of block rewards flows into a treasury for development and marketing."
      }
    ]
  },
  defichain: {
    name: "DEFICHAIN",
    symbol: "DFI",
    apy: 5.00,
    minStake: "200",
    icon: SiBinance,
    description: "DeFiChain is the blockchain for decentralized finance applications.",
    enabled: false,
    technicalDetails: {
      consensus: "Proof of Stake (PoS)",
      blockTime: "30 seconds",
      maxSupply: "1.2 billion DFI",
      features: [
        "DeFi-focused Chain",
        "Bitcoin Anchor Chain",
        "Decentralized Assets",
        "Liquidity Mining"
      ]
    },
    stakingDetails: {
      minStake: "200",
      apy: 5.00,
      rewards: "DeFiChain combines staking rewards with DeFi yields."
    },
    documentation: [
      {
        question: "What makes DeFiChain unique?",
        answer: "DeFiChain is specifically optimized for DeFi applications and anchored to Bitcoin."
      },
      {
        question: "How does Liquidity Mining work?",
        answer: "Besides staking, you can also provide liquidity and earn additional rewards."
      }
    ]
  },
  firo: {
    name: "FIRO",
    symbol: "FIRO",
    apy: 13.00,
    minStake: "100",
    icon: SiLitecoin,
    description: "Firo (formerly Zcoin) is a leader in blockchain privacy technology.",
    enabled: false,
    technicalDetails: {
      consensus: "FiroPoS",
      blockTime: "5 minutes",
      maxSupply: "21.4 million FIRO",
      features: [
        "Lelantus Privacy",
        "Spark Protocol",
        "Fast Transactions",
        "LLMQ ChainLocks"
      ]
    },
    stakingDetails: {
      minStake: "100",
      apy: 13.00,
      rewards: "Firo rewards stakers for securing the privacy-focused network."
    },
    documentation: [
      {
        question: "What is Lelantus?",
        answer: "Lelantus is Firo's proprietary privacy technology for anonymous transactions."
      },
      {
        question: "How secure is Firo Staking?",
        answer: "Firo uses ChainLocks and a unique PoS mechanism for maximum security."
      }
    ]
  },
  gnosis: {
    name: "GNOSIS",
    symbol: "GNO",
    apy: 4.00,
    minStake: "1",
    icon: SiEthereum,
    description: "Gnosis Chain is an Ethereum-compatible blockchain with fast, cheap transactions.",
    enabled: false,
    technicalDetails: {
      consensus: "POSDAO",
      blockTime: "5 seconds",
      maxSupply: "10 million GNO",
      features: [
        "EVM Compatibility",
        "Layer-1 Scaling",
        "Low Fees",
        "Bridge to Ethereum"
      ]
    },
    stakingDetails: {
      minStake: "1",
      apy: 4.00,
      rewards: "Gnosis Chain validators receive rewards for block production and transaction fees."
    },
    documentation: [
      {
        question: "What is POSDAO?",
        answer: "POSDAO is a novel consensus algorithm that combines Delegated Proof of Stake with a DAO."
      },
      {
        question: "How does Ethereum compatibility work?",
        answer: "Gnosis Chain supports all Ethereum tools and smart contracts at significantly lower fees."
      }
    ]
  }
};