import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import type { JsonProspectRepository } from '../repositories/JsonProspectRepository.js';
import type { ProspectStatus } from '../repositories/interfaces.js';

const ALLOWED_STATUSES: ProspectStatus[] = [
  'new',
  'under_review',
  'briefing_scheduled',
  'qualified',
  'dna_sold',
  'disqualified',
];

export function createAdminProspectsRouter(prospectRepo: JsonProspectRepository) {
  const router = Router();

  // GET /api/admin/prospects
  router.get('/', requireAuth, async (req: Request, res: Response) => {
    const { page, pageSize, search, status, sortBy, sortOrder } = req.query;
    const result = await prospectRepo.findAll({
      page: page ? parseInt(String(page), 10) : 1,
      pageSize: pageSize ? parseInt(String(pageSize), 10) : 10,
      search: search ? String(search) : undefined,
      status: status ? String(status) : undefined,
      sortBy: sortBy as any,
      sortOrder: sortOrder as 'asc' | 'desc',
    });
    res.json(result);
  });

  // GET /api/admin/prospects/:id
  router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    const prospect = await prospectRepo.findById(req.params.id);
    if (!prospect) {
      res.status(404).json({ error: 'Prospect not found.' });
      return;
    }
    res.json(prospect);
  });

  // PATCH /api/admin/prospects/:id
  router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
    const { status, notes, assignedTo, briefingId } = req.body ?? {};
    const patch: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        res.status(400).json({ error: 'Invalid status value.' });
        return;
      }
      patch.status = status;
    }
    if (notes !== undefined) patch.notes = String(notes).slice(0, 5000);
    if (assignedTo !== undefined) patch.assignedTo = assignedTo ? String(assignedTo) : undefined;
    if (briefingId !== undefined) patch.briefingId = briefingId ? String(briefingId) : undefined;

    const updated = await prospectRepo.update(req.params.id, patch as any);
    if (!updated) {
      res.status(404).json({ error: 'Prospect not found.' });
      return;
    }
    res.json(updated);
  });

  return router;
}
