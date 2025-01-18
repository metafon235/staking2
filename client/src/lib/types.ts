declare global {
  interface Window {
    ethereum?: {
      isCoinbaseWallet?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

export interface StakingHistory {
  timestamp: number;
  amount: string;
}

export interface StakingData {
  totalStaked: string;
  rewards: string;
  projected: string;
  rewardsHistory: StakingHistory[];
}

export const STAKING_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "getTotalStaked",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "getRewards",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "getProjectedEarnings",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "getRewardsHistory",
    outputs: [
      {
        components: [
          { name: "timestamp", type: "uint256" },
          { name: "amount", type: "uint256" }
        ],
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "stake",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
] as const;

// This is a mock contract address, in production this would be the actual deployed contract
export const STAKING_CONTRACT_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
