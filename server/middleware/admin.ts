import { Request, Response, NextFunction } from 'express';
import { db } from '@db';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      isAdmin: boolean;
    }
    interface Session {
      adminId?: number;
      isAdminSession?: boolean;
    }
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session?.adminId || !req.session?.isAdminSession) {
      return res.status(401).json({ error: 'No active admin session' });
    }

    const admin = await db.query.users.findFirst({
      where: eq(users.id, req.session.adminId)
    });

    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Attach admin user to request
    req.user = admin;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}