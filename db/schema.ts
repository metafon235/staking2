import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
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

export const userRelations = relations(users, ({ many }) => ({
  stakes: many(stakes),
  transactions: many(transactions),
}));

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

export const stakesRelations = relations(stakes, ({ one, many }) => ({
  user: one(users, {
    fields: [stakes.userId],
    references: [users.id],
  }),
  rewards: many(rewards),
}));

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  stakeId: integer("stake_id").references(() => stakes.id).notNull(),
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  transactionHash: text("transaction_hash"),
  cdpRewardId: text("cdp_reward_id"),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rewardsRelations = relations(rewards, ({ one }) => ({
  stake: one(stakes, {
    fields: [rewards.stakeId],
    references: [stakes.id],
  }),
}));


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

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const stakingSettings = pgTable("staking_settings", {
  id: serial("id").primaryKey(),
  coinSymbol: text("coin_symbol").notNull(),
  displayedApy: decimal("displayed_apy", { precision: 4, scale: 2 }).notNull(),
  actualApy: decimal("actual_apy", { precision: 4, scale: 2 }).notNull(),
  minStakeAmount: decimal("min_stake_amount", { precision: 36, scale: 18 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const stakingSettingsRelations = relations(stakingSettings, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [stakingSettings.updatedBy],
    references: [users.id],
  }),
}));

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), 
  subtype: text("subtype").notNull(), 
  userId: integer("user_id").references(() => users.id),
  data: text("data"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityMetrics = pgTable("activity_metrics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  totalValueLocked: decimal("total_value_locked", { precision: 36, scale: 18 }).notNull(),
  userCount: integer("user_count").notNull(),
  activeStakes: integer("active_stakes").notNull(),
  adminRewards: decimal("admin_rewards", { precision: 36, scale: 18 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema validations
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

export const insertTransactionSchema = createInsertSchema(transactions);
export const selectTransactionSchema = createSelectSchema(transactions);
export type InsertTransaction = typeof transactions.$inferInsert;
export type SelectTransaction = typeof transactions.$inferSelect;

export const insertStakingSettingsSchema = createInsertSchema(stakingSettings);
export const selectStakingSettingsSchema = createSelectSchema(stakingSettings);
export type InsertStakingSettings = typeof stakingSettings.$inferInsert;
export type SelectStakingSettings = typeof stakingSettings.$inferSelect;