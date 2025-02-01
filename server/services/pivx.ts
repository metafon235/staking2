
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class PivxWalletService {
  private rpcUser: string;
  private rpcPassword: string;
  private rpcPort: number;

  constructor() {
    this.rpcUser = process.env.PIVX_RPC_USER || 'pivxuser';
    this.rpcPassword = process.env.PIVX_RPC_PASSWORD || 'pivxpass';
    this.rpcPort = parseInt(process.env.PIVX_RPC_PORT || '51473');
  }

  async createColdStakingAddress(): Promise<string> {
    const { stdout } = await execAsync('pivx-cli getnewaddress');
    return stdout.trim();
  }

  async createOwnerAddress(): Promise<string> {
    const { stdout } = await execAsync('pivx-cli getnewaddress');
    return stdout.trim();
  }

  async getStakingRewards(address: string): Promise<number> {
    const { stdout } = await execAsync(`pivx-cli getcoldstakinginfo ${address}`);
    const info = JSON.parse(stdout);
    return info.rewards || 0;
  }

  async withdrawRewards(userAddress: string, amount: number): Promise<string> {
    // Calculate platform fee (3%)
    const fee = amount * 0.03;
    const userAmount = amount - fee;
    
    // Send 97% to user
    const userTx = await execAsync(`pivx-cli sendtoaddress ${userAddress} ${userAmount}`);
    
    // Send 3% to platform wallet
    const platformWallet = process.env.PLATFORM_WALLET_ADDRESS;
    const feeTx = await execAsync(`pivx-cli sendtoaddress ${platformWallet} ${fee}`);
    
    return userTx.stdout.trim();
  }
}

export const pivxWallet = new PivxWalletService();
