import { toast } from '@/hooks/use-toast';

export const connectWallet = async () => {
  if (!window.ethereum?.isCoinbaseWallet) {
    window.open('https://www.coinbase.com/wallet', '_blank');
    throw new Error('Please install Coinbase Wallet');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return accounts[0];
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
};

export const disconnectWallet = async () => {
  if (window.ethereum?.isCoinbaseWallet) {
    try {
      await window.ethereum.request({
        method: 'wallet_disconnectApp'
      });
      return true;
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }
  return false;
};