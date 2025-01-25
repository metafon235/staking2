import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Add notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // reward, price_change, system
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  data: text("data"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

export const notificationSettings = pgTable("notification_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rewardThreshold: decimal("reward_threshold", { precision: 36, scale: 18 }), // Minimum reward amount to notify
  priceChangeThreshold: decimal("price_change_threshold", { precision: 5, scale: 2 }), // Percentage change to trigger notification
  emailNotifications: boolean("email_notifications").default(true),
  browserNotifications: boolean("browser_notifications").default(true),
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

// Add schemas for new tables
export const insertNotificationSchema = createInsertSchema(notifications);
export const selectNotificationSchema = createSelectSchema(notifications);
export type InsertNotification = typeof notifications.$inferInsert;
export type SelectNotification = typeof notifications.$inferSelect;

export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings);
export const selectNotificationSettingsSchema = createSelectSchema(notificationSettings);
export type InsertNotificationSettings = typeof notificationSettings.$inferInsert;
export type SelectNotificationSettings = typeof notificationSettings.$inferSelect;

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, "Username must be at least 3 characters"),
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