import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Access denied. Admin privileges required." });
  }

  next();
}
