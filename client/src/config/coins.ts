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
    description: "PIVX Staking enables you to earn passive income while supporting network security and decentralization.",
    enabled: true,
    technicalDetails: {
      consensus: "Proof of Stake (PoS)",
      blockTime: "60 seconds",
      maxSupply: "21 million PIVX",
      features: [
        "Fast Transactions",
        "Energy-efficient PoS",
        "Privacy via zk-SNARKs",
        "Decentralized Governance",
        "Cold Staking Support"
      ]
    },
    stakingDetails: {
      minStake: "100",
      apy: 10.00,
      rewards: "Rewards are distributed every 60 seconds based on your stake size and network activity."
    },
    documentation: [
      {
        question: "What is PIVX Staking?",
        answer: "PIVX Staking is a process where you lock your PIVX coins as collateral to secure the network and earn rewards in return."
      },
      {
        question: "How does the staking process work?",
        answer: "Once you stake the minimum amount of 100 PIVX, you automatically participate in network consensus. Your chance to validate blocks and receive rewards is proportional to your stake."
      },
      {
        question: "How secure is PIVX Staking?",
        answer: "PIVX uses advanced cryptography and a secure Proof-of-Stake mechanism. Your coins remain under your control, and staking is done through secure smart contracts."
      }
    ]
  },
  pac: {
    name: "PAC",
    symbol: "PAC",
    apy: 8.50,
    minStake: "1000",
    icon: PivxIcon,
    description: "PAC Protocol enables decentralized staking with a focus on community and sustainability.",
    enabled: false,
    technicalDetails: {
      consensus: "Proof of Stake (PoS)",
      blockTime: "120 seconds",
      maxSupply: "100 billion PAC",
      features: [
        "Community Governance",
        "Masternode System",
        "Fast Transactions",
        "Cross-Chain Compatibility"
      ]
    },
    stakingDetails: {
      minStake: "1000",
      apy: 8.50,
      rewards: "PAC staking rewards are distributed every 120 seconds and further amplified by the masternode system."
    },
    documentation: [
      {
        question: "What makes PAC Protocol special?",
        answer: "PAC Protocol stands out due to its unique masternode system and strong community governance."
      },
      {
        question: "How does the PAC Masternode system work?",
        answer: "Masternodes require a higher stake and offer additional rewards for network services such as InstantSend and PrivateSend."
      }
    ]
  },
  wagerr: {
    name: "WAGERR",
    symbol: "WGR",
    apy: 9.00,
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
      apy: 9.00,
      rewards: "WGR staking combines PoS rewards with fees from the sports betting platform."
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
    apy: 7.50,
    minStake: "500",
    icon: PivxIcon,
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
      apy: 7.50,
      rewards: "Crown distributes staking rewards based on a dynamic reward model."
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
    apy: 12.00,
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
      apy: 12.00,
      rewards: "Energi offers one of the highest staking yields in the crypto sector."
    },
    documentation: [
      {
        question: "How does Energi differ from other PoS coins?",
        answer: "Energi combines high staking yields with smart contract functionality and Layer-2 scaling."
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
    apy: 15.00,
    minStake: "200",
    icon: PivxIcon,
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
      apy: 15.00,
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
    apy: 11.00,
    minStake: "100",
    icon: PivxIcon,
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
      apy: 11.00,
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
    apy: 14.00,
    minStake: "1",
    icon: PivxIcon,
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
      apy: 14.00,
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