import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { createError } from '../middleware/errorHandler';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('AuthRoutes');

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  companyName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName, companyName } = registerSchema.parse(req.body);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // TODO: Save to database
    // For now, return mock response
    const userId = 'user_' + Date.now();
    const tenantId = 'tenant_' + Date.now();

    logger.info('User registered', { email, userId });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        email,
        fullName,
        tenantId,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // TODO: Fetch user from database
    // For now, mock authentication
    const mockUser = {
      id: 'user_123',
      email,
      fullName: 'Demo User',
      tenantId: 'tenant_123',
      role: 'admin',
      passwordHash: await bcrypt.hash('password123', 10),
    };

    // Verify password
    const isValidPassword = await bcrypt.compare(password, mockUser.passwordHash);
    if (!isValidPassword) {
      throw createError('Invalid credentials', 401);
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw createError('JWT secret not configured', 500);
    }

    const token = jwt.sign(
      {
        id: mockUser.id,
        email: mockUser.email,
        tenantId: mockUser.tenantId,
        role: mockUser.role,
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info('User logged in', { email, userId: mockUser.id });

    res.json({
      token,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        tenantId: mockUser.tenantId,
        role: mockUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', (req, res) => {
  // Token is stateless, so logout is handled client-side
  res.json({ message: 'Logged out successfully' });
});

export default router;
