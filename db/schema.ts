import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  referrerId: integer("referrer_id").references(() => users.id),
  referralCode: text("referral_code").unique(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stakes = pgTable("stakes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  status: text("status").notNull().default("pending"),
  cdpStakeId: text("cdp_stake_id"),
  cdpValidatorId: text("cdp_validator_id"),
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  stakeId: integer("stake_id").references(() => stakes.id).notNull(),
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  transactionHash: text("transaction_hash"),
  cdpRewardId: text("cdp_reward_id"),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referralRewards = pgTable("referral_rewards", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").references(() => users.id).notNull(),
  referredId: integer("referred_id").references(() => users.id).notNull(),
  rewardId: integer("reward_id").references(() => rewards.id).notNull(),
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  status: text("status").notNull().default("pending"),
  transactionHash: text("transaction_hash"),
  cdpTransactionId: text("cdp_transaction_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stakingSettings = pgTable("staking_settings", {
  id: serial("id").primaryKey(),
  coinSymbol: text("coin_symbol").notNull(),
  displayedApy: decimal("displayed_apy", { precision: 4, scale: 2 }).notNull(), 
  actualApy: decimal("actual_apy", { precision: 4, scale: 2 }).notNull(), 
  minStakeAmount: decimal("min_stake_amount", { precision: 36, scale: 18 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const insertStakeSchema = createInsertSchema(stakes);
export const selectStakeSchema = createSelectSchema(stakes);
export type InsertStake = typeof stakes.$inferInsert;
export type SelectStake = typeof stakes.$inferSelect;

export const insertRewardSchema = createInsertSchema(rewards);
export const selectRewardSchema = createSelectSchema(rewards);
export type InsertReward = typeof rewards.$inferInsert;
export type SelectReward = typeof rewards.$inferSelect;

export const insertReferralRewardSchema = createInsertSchema(referralRewards);
export const selectReferralRewardSchema = createSelectSchema(referralRewards);
export type InsertReferralReward = typeof referralRewards.$inferInsert;
export type SelectReferralReward = typeof referralRewards.$inferSelect;

export const insertTransactionSchema = createInsertSchema(transactions);
export const selectTransactionSchema = createSelectSchema(transactions);
export type InsertTransaction = typeof transactions.$inferInsert;
export type SelectTransaction = typeof transactions.$inferSelect;

export const insertStakingSettingsSchema = createInsertSchema(stakingSettings);
export const selectStakingSettingsSchema = createSelectSchema(stakingSettings);
export type InsertStakingSettings = typeof stakingSettings.$inferInsert;
export type SelectStakingSettings = typeof stakingSettings.$inferSelect;