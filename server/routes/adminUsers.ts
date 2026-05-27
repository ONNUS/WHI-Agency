import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import type { JsonUserRepository } from '../repositories/JsonUserRepository.js';
import type { UserRole } from '../repositories/interfaces.js';

const ALLOWED_ROLES: UserRole[] = ['admin', 'analyst'];

function stripSensitive(u: any) {
  const { passwordHash, refreshTokenHashes, ...safe } = u;
  return safe;
}

export function createAdminUsersRouter(userRepo: JsonUserRepository) {
  const router = Router();

  // GET /api/admin/users
  router.get('/', requireAdmin, async (_req: Request, res: Response) => {
    const users = await userRepo.findAll();
    res.json(users);
  });

  // GET /api/admin/users/:id
  router.get('/:id', requireAdmin, async (req: Request, res: Response) => {
    const user = await userRepo.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    res.json(stripSensitive(user));
  });

  // POST /api/admin/users  — create new staff
  router.post('/', requireAdmin, async (req: Request, res: Response) => {
    const { username, name, email, password, role } = req.body ?? {};
    if (!username || !name || !password || !role) {
      res.status(400).json({ error: 'username, name, password, and role are required.' });
      return;
    }
    if (!ALLOWED_ROLES.includes(role)) {
      res.status(400).json({ error: 'Role must be admin or analyst.' });
      return;
    }
    const existing = await userRepo.findByUsername(String(username));
    if (existing) {
      res.status(409).json({ error: 'Username already exists.' });
      return;
    }
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(String(password), rounds);
    const user = await userRepo.create({
      username: String(username),
      name: String(name),
      email: email ? String(email) : undefined,
      role,
      isActive: true,
      passwordHash,
      requirePasswordChange: true,
      refreshTokenHashes: [],
    });
    res.status(201).json(stripSensitive(user));
  });

  // PATCH /api/admin/users/:id
  router.patch('/:id', requireAdmin, async (req: Request, res: Response) => {
    const { name, email, role, isActive, password } = req.body ?? {};
    const requesterId = req.user!.sub;

    // Admin cannot deactivate their own account
    if (req.params.id === requesterId && isActive === false) {
      res.status(400).json({ error: 'You cannot deactivate your own account.' });
      return;
    }

    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = String(name);
    if (email !== undefined) patch.email = email ? String(email) : undefined;
    if (role !== undefined) {
      if (!ALLOWED_ROLES.includes(role)) {
        res.status(400).json({ error: 'Role must be admin or analyst.' });
        return;
      }
      patch.role = role;
    }
    if (isActive !== undefined) patch.isActive = Boolean(isActive);
    if (password !== undefined && password !== '') {
      const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
      patch.passwordHash = await bcrypt.hash(String(password), rounds);
      patch.requirePasswordChange = true;
    }

    const updated = await userRepo.update(req.params.id, patch as any);
    if (!updated) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    res.json(stripSensitive(updated));
  });

  // POST /api/admin/users/me/password  — change own password
  router.post('/me/password', requireAuth, async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body ?? {};
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'currentPassword and newPassword are required.' });
      return;
    }
    if (String(newPassword).length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters.' });
      return;
    }
    const user = await userRepo.findById(req.user!.sub);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    const match = await bcrypt.compare(String(currentPassword), user.passwordHash);
    if (!match) {
      res.status(401).json({ error: 'Current password is incorrect.' });
      return;
    }
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(String(newPassword), rounds);
    await userRepo.update(user.id, { passwordHash, requirePasswordChange: false });
    res.json({ ok: true });
  });

  return router;
}
