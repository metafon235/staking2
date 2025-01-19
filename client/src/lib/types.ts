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
  rewards: number;
}

export interface StakingData {
  totalStaked: number;
  rewards: number;
  projected: number;
  rewardsHistory: StakingHistory[];
}

export interface StakingResponse {
  id: string;
  status: string;
  amount: string;
  currency: string;
  transactionId?: string;
}