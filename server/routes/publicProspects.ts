import { Router } from 'express';
import type { Request, Response } from 'express';
import type { JsonProspectRepository } from '../repositories/JsonProspectRepository.js';

export function createPublicProspectsRouter(prospectRepo: JsonProspectRepository) {
  const router = Router();

  // POST /api/prospects  — public contact form from BriefingForm.tsx
  router.post('/', async (req: Request, res: Response) => {
    const { name, email, phone, notes, submissionId } = req.body ?? {};

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required.' });
      return;
    }

    // Basic email format check
    const emailStr = String(email).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
      res.status(400).json({ error: 'Invalid email format.' });
      return;
    }

    const prospect = await prospectRepo.create({
      name: String(name).trim().slice(0, 200),
      email: emailStr,
      phone: phone ? String(phone).trim().slice(0, 50) : undefined,
      notes: notes ? String(notes).trim().slice(0, 2000) : undefined,
      status: 'new',
      briefingId: submissionId ? String(submissionId) : undefined,
    });

    res.status(201).json({ ok: true, prospectId: prospect.id });
  });

  return router;
}
