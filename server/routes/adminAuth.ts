import { Router } from 'express';
import type { Request, Response } from 'express';
import * as authService from '../services/authService.js';
import { requireAuth } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import type { JsonUserRepository } from '../repositories/JsonUserRepository.js';

const COOKIE_NAME = 'whi_refresh';

function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/api/admin/auth',
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export function createAdminAuthRouter(userRepo: JsonUserRepository) {
  const router = Router();

  // POST /api/admin/auth/login
  router.post('/login', loginLimiter, async (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required.' });
      return;
    }
    try {
      const result = await authService.login(String(username), String(password), userRepo);
      res.cookie(COOKIE_NAME, result.refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));
      res.json({ accessToken: result.accessToken, user: result.user });
    } catch {
      res.status(401).json({ error: 'Invalid credentials.' });
    }
  });

  // POST /api/admin/auth/refresh
  router.post('/refresh', async (req: Request, res: Response) => {
    const rawToken = req.cookies?.[COOKIE_NAME];
    if (!rawToken) {
      res.status(401).json({ error: 'No refresh token.' });
      return;
    }
    try {
      const result = await authService.refresh(rawToken, userRepo);
      res.cookie(COOKIE_NAME, result.refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));
      res.json({ accessToken: result.accessToken });
    } catch {
      res.clearCookie(COOKIE_NAME, cookieOptions());
      res.status(401).json({ error: 'Refresh token invalid or expired.' });
    }
  });

  // POST /api/admin/auth/logout
  router.post('/logout', async (req: Request, res: Response) => {
    const rawToken = req.cookies?.[COOKIE_NAME];
    if (rawToken) {
      await authService.logout(rawToken, userRepo).catch(() => {});
    }
    res.clearCookie(COOKIE_NAME, cookieOptions());
    res.json({ ok: true });
  });

  // GET /api/admin/auth/me
  router.get('/me', requireAuth, async (req: Request, res: Response) => {
    const user = await userRepo.findById(req.user!.sub);
    if (!user) {
      res.status(401).json({ error: 'User not found.' });
      return;
    }
    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      requirePasswordChange: user.requirePasswordChange,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  });

  return router;
}
