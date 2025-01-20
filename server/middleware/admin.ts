import { Request, Response, NextFunction } from 'express';

// Mock admin data
const MOCK_ADMIN = {
  id: 1,
  email: 'admin@example.com',
  isAdmin: true
};

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
    console.log('Admin middleware: Checking session', req.session);

    // Check if there's an active admin session
    if (!req.session?.adminId || !req.session?.isAdminSession) {
      console.log('Admin middleware: No active admin session');
      return res.status(401).json({ error: 'No active admin session' });
    }

    // In mock mode, we just check if the session ID matches our mock admin
    if (req.session.adminId === MOCK_ADMIN.id) {
      console.log('Admin middleware: Valid admin session found');
      req.user = MOCK_ADMIN;
      return next();
    }

    console.log('Admin middleware: Invalid admin session');
    return res.status(403).json({ error: 'Admin access required' });
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}