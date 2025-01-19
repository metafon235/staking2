import { z } from 'zod';

export interface StakingData {
  totalStaked: number;
  rewards: number;
  monthlyRewards: number;
  rewardsHistory: Array<{
    timestamp: number;
    rewards: number;
  }>;
}

export const getStakingData = async (): Promise<StakingData> => {
  try {
    const response = await fetch('/api/staking/data', {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch staking data: ${response.statusText}`);
    }

    const data = await response.json();

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

export const submitStakeTransaction = async (stakeId: number, transactionHash: string): Promise<void> => {
  const response = await fetch(`/api/stakes/${stakeId}/transaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ transactionHash }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit transaction');
  }
};

export const stakeETH = async (amount: number): Promise<{ id: number }> => {
  const response = await fetch('/api/stakes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      amount: amount.toString()
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to stake ETH');
  }

  return response.json();
};

export const getStakingWallet = async (): Promise<{ address: string }> => {
  const response = await fetch('/api/staking/wallet', {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to get staking wallet address');
  }

  return response.json();
};