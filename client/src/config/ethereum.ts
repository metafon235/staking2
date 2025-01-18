export const ETH_CONFIG = {
  WALLET_ADDRESS: import.meta.env.VITE_ETH_WALLET_ADDRESS || '',
  STAKING_CONTRACT_ADDRESS: import.meta.env.VITE_ETH_STAKING_CONTRACT || '',
  RPC_URL: import.meta.env.VITE_ETH_RPC_URL || ''
};

// Validate config
if (!ETH_CONFIG.WALLET_ADDRESS) {
  throw new Error('VITE_ETH_WALLET_ADDRESS environment variable is not set');
}
if (!ETH_CONFIG.STAKING_CONTRACT_ADDRESS) {
  throw new Error('VITE_ETH_STAKING_CONTRACT environment variable is not set');
}
if (!ETH_CONFIG.RPC_URL) {
  throw new Error('VITE_ETH_RPC_URL environment variable is not set');
}