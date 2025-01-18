import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  app.get('/api/staking/data', async (req, res) => {
    try {
      // Here we would fetch data from the blockchain
      // This is a mock implementation
      const mockData = {
        totalStaked: 32.5,
        rewards: 0.85,
        projected: 1.2,
        rewardsHistory: [
          { timestamp: Date.now() - 86400000 * 30, rewards: 0.2 },
          { timestamp: Date.now() - 86400000 * 20, rewards: 0.4 },
          { timestamp: Date.now() - 86400000 * 10, rewards: 0.6 },
          { timestamp: Date.now(), rewards: 0.85 }
        ]
      };
      
      res.json(mockData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch staking data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
