import { z } from 'zod';

export interface StakingData {
  totalStaked: number;
  rewards: number;
  monthlyRewards: number; // Renamed from projected
  rewardsHistory: Array<{
    timestamp: number;
    rewards: number;
  }>;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, handler: (params: any) => void) => void;
      removeListener: (eventName: string, handler: (params: any) => void) => void;
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
    };
  }
}

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('No Web3 wallet found. Please install Coinbase Wallet or MetaMask');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return accounts[0];
  } catch (error: any) {
    console.error('Failed to connect wallet:', error);
    throw new Error(error.message || 'Failed to connect wallet');
  }
};

export const sendTransaction = async (amount: string): Promise<string> => {
  if (!window.ethereum) {
    throw new Error('No Web3 wallet found');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // Convert ETH amount to Wei (1 ETH = 10^18 Wei)
    const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18)).toString(16);

    const transactionParameters = {
      from: accounts[0],
      value: '0x' + amountInWei,
      gas: '0x5208', // 21000 gas
    };

    // This will trigger the wallet popup
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });

    return txHash;
  } catch (error: any) {
    console.error('Transaction failed:', error);
    throw new Error(error.message || 'Failed to send transaction');
  }
};

export const getStakingData = async (): Promise<StakingData> => {
  try {
    const response = await fetch('/api/staking/data', {
      credentials: 'include' // Required for auth
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch staking data: ${response.statusText}`);
    }

    const data = await response.json();

    // Ensure 9 decimal precision for numeric values
    return {
      ...data,
      totalStaked: parseFloat(data.totalStaked.toFixed(9)),
      rewards: parseFloat(data.rewards.toFixed(9)),
      monthlyRewards: parseFloat(data.monthlyRewards.toFixed(9)),
      rewardsHistory: data.rewardsHistory.map((point: any) => ({
        timestamp: point.timestamp,
        rewards: parseFloat(point.rewards.toFixed(9))
      }))
    };
  } catch (error) {
    console.error('Failed to fetch staking data:', error);
    throw error;
  }
};

export const stakeETH = async (amount: number): Promise<void> => {
  const response = await fetch('/api/stakes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Required for auth
    body: JSON.stringify({
      amount: amount.toString()
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to stake ETH');
  }
};