import { Router } from "express";
import { db } from "@db";
import { users, stakes, transactions } from "@db/schema";
import { requireAdmin } from "../middleware/adminAuth";
import { desc, sql } from "drizzle-orm";

const router = Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get system overview
router.get("/overview", async (req, res) => {
  try {
    const [stats] = await db
      .select({
        totalUsers: sql<number>`count(distinct ${users.id})`,
        totalStakes: sql<number>`count(distinct ${stakes.id})`,
        totalTransactions: sql<number>`count(distinct ${transactions.id})`,
        totalStakedAmount: sql<string>`sum(${stakes.amount}::numeric)`,
      })
      .from(users)
      .leftJoin(stakes, sql`${stakes.userId} = ${users.id}`)
      .leftJoin(transactions, sql`${transactions.userId} = ${users.id}`);

    res.json({
      stats: {
        totalUsers: stats.totalUsers || 0,
        totalStakes: stats.totalStakes || 0,
        totalTransactions: stats.totalTransactions || 0,
        totalStakedAmount: parseFloat(stats.totalStakedAmount || "0"),
      },
    });
  } catch (error) {
    console.error("Error fetching admin overview:", error);
    res.status(500).json({ error: "Failed to fetch admin overview" });
  }
});

// Get all users with their stakes
router.get("/users", async (req, res) => {
  try {
    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });

    res.json(allUsers.map(user => ({
      id: user.id,
      username: user.username,
      walletAddress: user.walletAddress,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    })));
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user details including stakes and transactions
router.get("/users/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await db.query.users.findFirst({
      where: sql`${users.id} = ${userId}`,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userStakes = await db.query.stakes.findMany({
      where: sql`${stakes.userId} = ${userId}`,
      orderBy: [desc(stakes.createdAt)],
    });

    const userTransactions = await db.query.transactions.findMany({
      where: sql`${transactions.userId} = ${userId}`,
      orderBy: [desc(transactions.createdAt)],
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        walletAddress: user.walletAddress,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
      stakes: userStakes,
      transactions: userTransactions,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

export default router;
