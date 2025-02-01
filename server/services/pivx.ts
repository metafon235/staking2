import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export class PivxWalletService {
  private dataDir: string;

  constructor() {
    this.dataDir = process.env.PIVX_DATA_DIR || '~/.pivx';
  }

  async createColdStakingAddress(): Promise<string> {
    try {
      const { stdout } = await execAsync(`pivx-cli -datadir=${this.dataDir} getnewstakingaddress`);
      return stdout.trim();
    } catch (error) {
      console.error('Error creating cold staking address:', error);
      throw error;
    }
  }

  async createOwnerAddress(): Promise<string> {
    try {
      const { stdout } = await execAsync(`pivx-cli -datadir=${this.dataDir} getnewaddress "owner"`);
      return stdout.trim();
    } catch (error) {
      console.error('Error creating owner address:', error);
      throw error;
    }
  }

  async delegateStake(ownerAddress: string, stakingAddress: string, amount: number): Promise<string> {
    try {
      const { stdout } = await execAsync(
        `pivx-cli -datadir=${this.dataDir} delegatestake "${stakingAddress}" ${amount} false "${ownerAddress}"`
      );
      return stdout.trim();
    } catch (error) {
      console.error('Error delegating stake:', error);
      throw error;
    }
  }
}
export const pivxWallet = new PivxWalletService();