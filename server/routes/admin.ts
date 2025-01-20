import { Router } from 'express';
import { requireAdmin } from '../middleware/admin';
import { z } from 'zod';

const router = Router();

// Mock admin credentials
const MOCK_ADMIN = {
  id: 1,
  email: 'monerominercom@gmail.com',
  password: 'metafon23',
  isAdmin: true
};

// Public routes (no middleware)
router.post('/login', async (req, res) => {
  try {
    console.log('Admin login attempt:', req.body);
    const { email, password } = req.body;

    // Check against mock admin credentials
    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
      console.log('Admin credentials valid, setting session');

      // Set admin session
      if (req.session) {
        req.session.adminId = MOCK_ADMIN.id;
        req.session.isAdminSession = true;
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            resolve();
          });
        });
      }

      res.json({
        message: "Admin login successful",
        user: {
          id: MOCK_ADMIN.id,
          email: MOCK_ADMIN.email,
          isAdmin: MOCK_ADMIN.isAdmin
        }
      });
    } else {
      console.log('Invalid admin credentials');
      res.status(401).json({ message: "Invalid admin credentials" });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Protected routes below this point
router.use(requireAdmin);

router.get('/session', async (req, res) => {
  try {
    console.log('Admin session check:', req.session);
    if (!req.session?.adminId || !req.session?.isAdminSession) {
      return res.status(401).json({ message: "No active admin session" });
    }

    // Return mock admin data
    res.json({
      user: {
        id: MOCK_ADMIN.id,
        email: MOCK_ADMIN.email,
        isAdmin: MOCK_ADMIN.isAdmin
      }
    });
  } catch (error) {
    console.error('Admin session check error:', error);
    res.status(500).json({ message: "Session check failed" });
  }
});


// Admin logout
router.post('/logout', (req, res) => {
  console.log('Admin logout request');
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Admin logout error:', err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Admin logout successful" });
    });
  } else {
    res.json({ message: "Admin logout successful" });
  }
});

export default router;