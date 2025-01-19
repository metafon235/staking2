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

// Add new function for sending payment requests
export const requestPayment = async (toAddress: string, amount: string) => {
  if (!window.ethereum?.isCoinbaseWallet) {
    throw new Error('Coinbase Wallet is required');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    const transactionParameters = {
      from: accounts[0],
      to: toAddress,
      value: '0x' + (Number(amount) * 1e18).toString(16), // Convert ETH to Wei
      gas: '0x5208', // 21000 gas
    };

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });

    return txHash;
  } catch (error) {
    console.error('Payment request failed:', error);
    throw error;
  }
};

// Helper function to check if the wallet is connected
export const isWalletConnected = async () => {
  if (!window.ethereum?.isCoinbaseWallet) {
    return false;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    });
    return accounts && accounts.length > 0;
  } catch {
    return false;
  }
};