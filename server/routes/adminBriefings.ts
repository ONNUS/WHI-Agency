import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import type { JsonBriefingRepository } from '../repositories/JsonBriefingRepository.js';

export function createAdminBriefingsRouter(briefingRepo: JsonBriefingRepository) {
  const router = Router();

  // GET /api/admin/briefings
  router.get('/', requireAuth, async (req: Request, res: Response) => {
    const { page, pageSize, search, sortBy, sortOrder, dateFrom, dateTo } = req.query;
    const result = await briefingRepo.findAll({
      page: page ? parseInt(String(page), 10) : 1,
      pageSize: pageSize ? parseInt(String(pageSize), 10) : 10,
      search: search ? String(search) : undefined,
      sortBy: sortBy as any,
      sortOrder: sortOrder as 'asc' | 'desc',
      dateFrom: dateFrom ? String(dateFrom) : undefined,
      dateTo: dateTo ? String(dateTo) : undefined,
    });
    res.json(result);
  });

  // GET /api/admin/briefings/:id
  router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    const briefing = await briefingRepo.findById(req.params.id);
    if (!briefing) {
      res.status(404).json({ error: 'Briefing not found.' });
      return;
    }
    res.json(briefing);
  });

  // DELETE /api/admin/briefings/:id
  router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
    const briefing = await briefingRepo.findById(req.params.id);
    if (!briefing) {
      res.status(404).json({ error: 'Briefing not found.' });
      return;
    }
    await briefingRepo.delete(req.params.id);
    res.json({ ok: true });
  });

  return router;
}
