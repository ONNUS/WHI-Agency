import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { JsonUserRepository } from '../repositories/JsonUserRepository.js';
import type { UserPublic } from '../repositories/interfaces.js';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface LoginResult extends TokenPair {
  user: UserPublic;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function accessSecret(): string {
  const s = process.env.JWT_ACCESS_SECRET;
  if (!s) throw new Error('JWT_ACCESS_SECRET is not set');
  return s;
}

function refreshExpiresAt(): string {
  const days = 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function login(
  username: string,
  password: string,
  userRepo: JsonUserRepository,
): Promise<LoginResult> {
  // Always look up AND compare — constant-time regardless of result
  const user = await userRepo.findByUsername(username);

  const dummyHash = '$2b$12$invalidhashfortimingnormalization000000000000000000000';
  const hashToCompare = user?.passwordHash ?? dummyHash;
  const match = await bcrypt.compare(password, hashToCompare);

  if (!user || !match || !user.isActive) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const accessToken = jwt.sign(
    { sub: user.id, role: user.role, username: user.username },
    accessSecret(),
    { expiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m' } as jwt.SignOptions,
  );

  const refreshToken = crypto.randomBytes(64).toString('hex');
  const hash = hashToken(refreshToken);

  await userRepo.update(user.id, {
    refreshTokenHashes: [
      ...user.refreshTokenHashes.filter(
        (r) => new Date(r.expiresAt) > new Date(),
      ),
      { hash, expiresAt: refreshExpiresAt() },
    ],
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      requirePasswordChange: user.requirePasswordChange,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

export async function refresh(
  rawRefreshToken: string,
  userRepo: JsonUserRepository,
): Promise<{ accessToken: string; refreshToken: string }> {
  const incomingHash = hashToken(rawRefreshToken);
  const users = await userRepo.findAllRaw();
  const now = new Date();

  for (const user of users) {
    const record = user.refreshTokenHashes?.find(
      (r) => r.hash === incomingHash && new Date(r.expiresAt) > now,
    );
    if (record) {
      // Rotate: revoke old hash, issue new pair
      const newRefreshToken = crypto.randomBytes(64).toString('hex');
      const newHash = hashToken(newRefreshToken);

      await userRepo.update(user.id, {
        refreshTokenHashes: [
          ...user.refreshTokenHashes.filter(
            (r) => r.hash !== incomingHash && new Date(r.expiresAt) > now,
          ),
          { hash: newHash, expiresAt: refreshExpiresAt() },
        ],
      });

      const accessToken = jwt.sign(
        { sub: user.id, role: user.role, username: user.username },
        accessSecret(),
        { expiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m' } as jwt.SignOptions,
      );

      return { accessToken, refreshToken: newRefreshToken };
    }
  }

  throw new Error('INVALID_REFRESH_TOKEN');
}

export async function logout(
  rawRefreshToken: string,
  userRepo: JsonUserRepository,
): Promise<void> {
  const incomingHash = hashToken(rawRefreshToken);
  const users = await userRepo.findAllRaw();

  for (const user of users) {
    const hasToken = user.refreshTokenHashes?.some((r) => r.hash === incomingHash);
    if (hasToken) {
      await userRepo.update(user.id, {
        refreshTokenHashes: user.refreshTokenHashes.filter((r) => r.hash !== incomingHash),
      });
      return;
    }
  }
}
