import { type InsertUser, type InsertStake, type InsertReward, type InsertTransaction } from "@db/schema";

// In-memory stores
const users = new Map<number, InsertUser & { id: number }>();
const stakes = new Map<number, InsertStake & { id: number }>();
const rewards = new Map<number, InsertReward & { id: number }>();
const transactions = new Map<number, InsertTransaction & { id: number }>();

// Auto-incrementing IDs
let userId = 1;
let stakeId = 1;
let rewardId = 1;
let transactionId = 1;

export const store = {
  // Users
  createUser: (data: InsertUser) => {
    const user = { ...data, id: userId++ };
    users.set(user.id, user);
    return user;
  },
  getUser: (id: number) => users.get(id),
  getUserByUsername: (username: string) => 
    Array.from(users.values()).find(u => u.username === username),

  // Stakes
  createStake: (data: InsertStake) => {
    const stake = { ...data, id: stakeId++ };
    stakes.set(stake.id, stake);
    return stake;
  },
  getStake: (id: number) => stakes.get(id),
  getStakesByUser: (userId: number) => 
    Array.from(stakes.values()).filter(s => s.userId === userId),

  // Rewards
  createReward: (data: InsertReward) => {
    const reward = { ...data, id: rewardId++ };
    rewards.set(reward.id, reward);
    return reward;
  },
  getReward: (id: number) => rewards.get(id),
  getRewardsByStake: (stakeId: number) =>
    Array.from(rewards.values()).filter(r => r.stakeId === stakeId),

  // Transactions
  createTransaction: (data: InsertTransaction) => {
    const transaction = { ...data, id: transactionId++ };
    transactions.set(transaction.id, transaction);
    return transaction;
  },
  getTransaction: (id: number) => transactions.get(id),
  getTransactionsByUser: (userId: number) =>
    Array.from(transactions.values()).filter(t => t.userId === userId),

  // Utility methods
  clear: () => {
    users.clear();
    stakes.clear();
    rewards.clear();
    transactions.clear();
    userId = 1;
    stakeId = 1;
    rewardId = 1;
    transactionId = 1;
  }
};
