import { z } from 'zod';

export interface StakingData {
  totalStaked: number;
  rewards: number;
  projected: number;
  rewardsHistory: Array<{
    timestamp: number;
    rewards: number;
  }>;
}

export const getStakingData = async (): Promise<StakingData> => {
  try {
    const response = await fetch('/api/staking/data');
    if (!response.ok) {
      throw new Error(`Failed to fetch staking data: ${response.statusText}`);
    }
    return response.json();
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
    body: JSON.stringify({
      amount: amount.toString(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to stake ETH');
  }
};