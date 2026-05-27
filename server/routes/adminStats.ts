import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import type { JsonBriefingRepository } from '../repositories/JsonBriefingRepository.js';
import type { JsonProspectRepository } from '../repositories/JsonProspectRepository.js';
import type { JsonUserRepository } from '../repositories/JsonUserRepository.js';

export function createAdminStatsRouter(
  briefingRepo: JsonBriefingRepository,
  prospectRepo: JsonProspectRepository,
  userRepo: JsonUserRepository,
) {
  const router = Router();

  router.get('/', requireAuth, async (_req: Request, res: Response) => {
    const [briefings, prospects, users] = await Promise.all([
      briefingRepo.findAll({ page: 1, pageSize: 5, sortBy: 'submittedAt', sortOrder: 'desc' }),
      prospectRepo.findAll({ page: 1, pageSize: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
      userRepo.findAll(),
    ]);

    const allBriefings = await briefingRepo.findAll({ page: 1, pageSize: 10000 });
    const totalBriefings = allBriefings.total;
    const avgScore =
      totalBriefings > 0
        ? parseFloat(
            (
              allBriefings.items.reduce((sum, b) => sum + (b.overallScore ?? 0), 0) /
              totalBriefings
            ).toFixed(1),
          )
        : 0;

    const allProspects = await prospectRepo.findAll({ page: 1, pageSize: 10000 });
    const newProspectCount = allProspects.items.filter((p) => p.status === 'new').length;

    res.json({
      briefingCount: totalBriefings,
      prospectCount: allProspects.total,
      newProspectCount,
      avgScore,
      activeStaffCount: users.filter((u) => u.isActive).length,
      recentBriefings: briefings.items,
      recentProspects: prospects.items,
    });
  });

  return router;
}
