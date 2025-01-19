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
    const response = await fetch('/api/staking/data', {
      credentials: 'include' // Required for auth
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch staking data: ${response.statusText}`);
    }

    const data = await response.json();

    // Ensure 8 decimal precision for numeric values
    return {
      ...data,
      totalStaked: parseFloat(data.totalStaked.toFixed(8)),
      rewards: parseFloat(data.rewards.toFixed(8)),
      projected: parseFloat(data.projected.toFixed(8)),
      rewardsHistory: data.rewardsHistory.map((point: any) => ({
        timestamp: point.timestamp,
        rewards: parseFloat(point.rewards.toFixed(8))
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