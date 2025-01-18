import Web3 from 'web3';
import { ETH_CONFIG } from '@/config/ethereum';
import { STAKING_ABI, type StakingData } from './types';

let web3: Web3 | null = null;

export const initWeb3 = async () => {
  if (!web3) {
    web3 = new Web3(ETH_CONFIG.RPC_URL);
  }
  return web3;
};

export const stakeETH = async (amount: number) => {
  if (!web3) {
    await initWeb3();
  }

  try {
    const stakingContract = new web3!.eth.Contract(
      STAKING_ABI,
      ETH_CONFIG.STAKING_CONTRACT_ADDRESS
    );

    const data = stakingContract.methods.stake().encodeABI();

    const tx = {
      from: ETH_CONFIG.WALLET_ADDRESS,
      to: ETH_CONFIG.STAKING_CONTRACT_ADDRESS,
      data: data,
      value: web3!.utils.toWei(amount.toString(), 'ether')
    };

    return tx;
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
    const stakingContract = new web3!.eth.Contract(
      STAKING_ABI,
      ETH_CONFIG.STAKING_CONTRACT_ADDRESS
    );

    const [totalStaked, rewards, projected, rewardsHistory] = await Promise.all([
      stakingContract.methods.getTotalStaked(ETH_CONFIG.WALLET_ADDRESS).call(),
      stakingContract.methods.getRewards(ETH_CONFIG.WALLET_ADDRESS).call(),
      stakingContract.methods.getProjectedEarnings(ETH_CONFIG.WALLET_ADDRESS).call(),
      stakingContract.methods.getRewardsHistory(ETH_CONFIG.WALLET_ADDRESS).call()
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