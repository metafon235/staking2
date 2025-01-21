import { db } from "@db";
import { notifications, notificationSettings, type InsertNotification } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export class NotificationService {
  static async createNotification(notification: InsertNotification) {
    const [created] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return created;
  }

  static async getUserNotifications(userId: number) {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  static async markAsRead(userId: number, notificationId: number) {
    return db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      )
      .returning();
  }

  static async getUserSettings(userId: number) {
    const [settings] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId))
      .limit(1);

    return settings;
  }

  static async updateUserSettings(
    userId: number,
    settings: Partial<typeof notificationSettings.$inferInsert>
  ) {
    const [existing] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId))
      .limit(1);

    if (existing) {
      return db
        .update(notificationSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(notificationSettings.userId, userId))
        .returning();
    }

    return db
      .insert(notificationSettings)
      .values({
        userId,
        ...settings,
      })
      .returning();
  }

  static async createRewardNotification(
    userId: number,
    amount: number,
    symbol: string
  ) {
    const settings = await this.getUserSettings(userId);

    if (settings?.rewardThreshold && amount < Number(settings.rewardThreshold)) {
      return null;
    }

    return this.createNotification({
      userId,
      type: "reward",
      title: "New Staking Reward",
      message: `You earned ${amount} ${symbol} from staking`,
      data: JSON.stringify({ amount, symbol }),
      read: false
    });
  }

  static async createPriceChangeNotification(
    userId: number,
    symbol: string,
    percentageChange: number
  ) {
    const settings = await this.getUserSettings(userId);

    if (
      settings?.priceChangeThreshold && 
      Math.abs(percentageChange) < Number(settings.priceChangeThreshold)
    ) {
      return null;
    }

    const direction = percentageChange > 0 ? "increased" : "decreased";

    return this.createNotification({
      userId,
      type: "price_change",
      title: `${symbol} Price Alert`,
      message: `${symbol} price has ${direction} by ${Math.abs(percentageChange)}%`,
      data: JSON.stringify({ symbol, percentageChange }),
      read: false
    });
  }
}