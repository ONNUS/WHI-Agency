import bcrypt from 'bcryptjs';
import type { JsonUserRepository } from '../repositories/JsonUserRepository.js';

export async function seed(userRepo: JsonUserRepository): Promise<void> {
  const hasAdmin = await userRepo.hasAdminUser();
  if (hasAdmin) return;

  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  const seedPassword = process.env.ADMIN_SEED_PASSWORD || '000111';
  const passwordHash = await bcrypt.hash(seedPassword, rounds);

  await userRepo.create({
    username: 'Admin',
    name: 'Admin',
    email: undefined,
    role: 'admin',
    isActive: true,
    passwordHash,
    requirePasswordChange: true,
    refreshTokenHashes: [],
  });

  console.log(
    '[WHI] Admin user seeded. Username: Admin — Change password on first login.',
  );
}
