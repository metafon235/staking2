import Web3 from 'web3';
import { toast } from '@/hooks/use-toast';
import { STAKING_ABI, STAKING_CONTRACT_ADDRESS, type StakingData } from './types';

let web3: Web3 | null = null;

export const initWeb3 = async () => {
  if (typeof window.ethereum !== 'undefined') {
    web3 = new Web3(window.ethereum);
    return web3;
  }
  throw new Error('No Web3 provider found');
};

export const stakeETH = async (amount: number) => {
  if (!web3) {
    await initWeb3();
  }

  try {
    const accounts = await web3!.eth.getAccounts();
    const stakingContract = new web3!.eth.Contract(
      STAKING_ABI,
      STAKING_CONTRACT_ADDRESS
    );

    await stakingContract.methods.stake().send({
      from: accounts[0],
      value: web3!.utils.toWei(amount.toString(), 'ether')
    });

    return true;
  } catch (error) {
    console.error('Staking error:', error);
    throw error;
  }
};

export const getStakingData = async (): Promise<StakingData> => {
  if (!web3) {
    await initWeb3();
  }

  try {
    const accounts = await web3!.eth.getAccounts();
    const stakingContract = new web3!.eth.Contract(
      STAKING_ABI,
      STAKING_CONTRACT_ADDRESS
    );

    const [totalStaked, rewards, projected, rewardsHistory] = await Promise.all([
      stakingContract.methods.getTotalStaked(accounts[0]).call(),
      stakingContract.methods.getRewards(accounts[0]).call(),
      stakingContract.methods.getProjectedEarnings(accounts[0]).call(),
      stakingContract.methods.getRewardsHistory(accounts[0]).call()
    ]);

    return {
      totalStaked: web3!.utils.fromWei(totalStaked, 'ether'),
      rewards: web3!.utils.fromWei(rewards, 'ether'),
      projected: web3!.utils.fromWei(projected, 'ether'),
      rewardsHistory: rewardsHistory.map((item: any) => ({
        timestamp: parseInt(item.timestamp.toString()) * 1000,
        amount: web3!.utils.fromWei(item.amount, 'ether')
      }))
    };
  } catch (error) {
    console.error('Failed to fetch staking data:', error);
    throw error;
  }
};