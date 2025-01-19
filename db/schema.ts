import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stakes = pgTable("stakes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  status: text("status").notNull().default("pending"),
  transactionHash: text("transaction_hash").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  stakeId: integer("stake_id").references(() => stakes.id).notNull(),
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  transactionHash: text("transaction_hash").unique(),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // stake, unstake, claim_reward
  amount: decimal("amount", { precision: 36, scale: 18 }).notNull(),
  status: text("status").notNull().default("pending"),
  transactionHash: text("transaction_hash").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema types
export const insertUserSchema = createInsertSchema(users);
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