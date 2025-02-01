
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export class PivxWalletService {
  private rpcUser: string;
  private rpcPassword: string;
  private rpcPort: number;
  private configPath: string;
  private dataDir: string;

  constructor() {
    this.rpcUser = process.env.PIVX_RPC_USER || 'pivxuser';
    this.rpcPassword = process.env.PIVX_RPC_PASSWORD || 'pivxpass';
    this.rpcPort = parseInt(process.env.PIVX_RPC_PORT || '51473');
    this.dataDir = process.env.PIVX_DATA_DIR || '/home/runner/pivx';
    this.configPath = path.join(this.dataDir, 'pivx.conf');
    
    this.initializeWallet();
  }

  private async initializeWallet() {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Create or update config file
    const config = `
rpcuser=${this.rpcUser}
rpcpassword=${this.rpcPassword}
rpcport=${this.rpcPort}
server=1
listen=1
daemon=1
maxconnections=256
rpcallowip=127.0.0.1
staking=1
enableaccounts=1
`;
    fs.writeFileSync(this.configPath, config);
    
    // Set secure permissions
    fs.chmodSync(this.configPath, 0o600);
    fs.chmodSync(this.dataDir, 0o700);
  }

  async createColdStakingAddress(): Promise<string> {
    try {
      // Create a new cold staking address
      const { stdout } = await execAsync(`pivx-cli -datadir=${this.dataDir} getnewstakingaddress`);
      return stdout.trim();
    } catch (error) {
      console.error('Error creating cold staking address:', error);
      throw error;
    }
  }

  async createOwnerAddress(): Promise<string> {
    try {
      // Create a new owner address for delegation control
      const { stdout } = await execAsync(`pivx-cli -datadir=${this.dataDir} getnewaddress "owner"`);
      return stdout.trim();
    } catch (error) {
      console.error('Error creating owner address:', error);
      throw error;
    }
  }

  async delegateStake(ownerAddress: string, stakingAddress: string, amount: number): Promise<string> {
    try {
      // Delegate stake from owner to staking address
      const { stdout } = await execAsync(
        `pivx-cli -datadir=${this.dataDir} delegatestake "${stakingAddress}" ${amount} false "${ownerAddress}"`
      );
      return stdout.trim(); // Returns delegation transaction ID
    } catch (error) {
      console.error('Error delegating stake:', error);
      throw error;
    }
  }

  async getColdStakingInfo(address: string): Promise<any> {
    try {
      // Get cold staking information for address
      const { stdout } = await execAsync(`pivx-cli -datadir=${this.dataDir} getcoldstakinginfo "${address}"`);
      return JSON.parse(stdout);
    } catch (error) {
      console.error('Error getting cold staking info:', error);
      throw error;
    }
  }

  async listDelegations(): Promise<any> {
    try {
      // List all delegated cold stakes
      const { stdout } = await execAsync(`pivx-cli -datadir=${this.dataDir} liststakingaddresses`);
      return JSON.parse(stdout);
    } catch (error) {
      console.error('Error listing delegations:', error);
      throw error;
    }
  }

  async getStakingRewards(address: string): Promise<number> {
    try {
      const { stdout } = await execAsync(`pivx-cli -datadir=${this.dataDir} getcoldstakinginfo ${address}`);
      const info = JSON.parse(stdout);
      return info.rewards || 0;
    } catch (error) {
      console.error('Error getting staking rewards:', error);
      throw error;
    }
  }

  async withdrawRewards(userAddress: string, amount: number): Promise<string> {
    try {
      // Calculate platform fee (3%)
      const fee = amount * 0.03;
      const userAmount = amount - fee;
      
      // Send 97% to user
      const { stdout: userTx } = await execAsync(
        `pivx-cli -datadir=${this.dataDir} sendtoaddress ${userAddress} ${userAmount}`
      );
      
      // Send 3% to platform wallet
      const platformWallet = process.env.PLATFORM_WALLET_ADDRESS;
      await execAsync(
        `pivx-cli -datadir=${this.dataDir} sendtoaddress ${platformWallet} ${fee}`
      );
      
      return userTx.trim();
    } catch (error) {
      console.error('Error withdrawing rewards:', error);
      throw error;
    }
  }

  async getWalletInfo(): Promise<any> {
    try {
      const { stdout } = await execAsync(`pivx-cli -datadir=${this.dataDir} getwalletinfo`);
      return JSON.parse(stdout);
    } catch (error) {
      console.error('Error getting wallet info:', error);
      throw error;
    }
  }
}

export const pivxWallet = new PivxWalletService();
