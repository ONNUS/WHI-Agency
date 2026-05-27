import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import type {
  Briefing,
  BriefingIndex,
  BriefingRepository,
  ListOptions,
} from './interfaces.js';

// ─── Mutex ────────────────────────────────────────────────────────────────────

class AsyncMutex {
  private _queue: (() => void)[] = [];
  private _locked = false;
  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      const attempt = () => {
        if (!this._locked) {
          this._locked = true;
          resolve(() => {
            this._locked = false;
            const next = this._queue.shift();
            if (next) next();
          });
        } else {
          this._queue.push(attempt);
        }
      };
      attempt();
    });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

async function atomicWrite(filePath: string, data: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, data, 'utf-8');
  await fs.rename(tmpPath, filePath);
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class JsonBriefingRepository implements BriefingRepository {
  private readonly briefingsDir: string;
  private readonly indexFile: string;
  private readonly indexMutex = new AsyncMutex();

  constructor(dataPath: string) {
    this.briefingsDir = path.join(dataPath, 'briefings');
    this.indexFile = path.join(dataPath, '_index', 'briefings.json');
    Promise.all([
      ensureDir(this.briefingsDir),
      ensureDir(path.join(dataPath, '_index')),
    ]).catch(() => {});
  }

  private async readIndex(): Promise<BriefingIndex[]> {
    try {
      const raw = await fs.readFile(this.indexFile, 'utf-8');
      return JSON.parse(raw) as BriefingIndex[];
    } catch {
      return [];
    }
  }

  private async writeIndex(items: BriefingIndex[]): Promise<void> {
    await atomicWrite(this.indexFile, JSON.stringify(items, null, 2));
  }

  private briefingFilePath(id: string): string {
    return path.join(this.briefingsDir, `${id}.json`);
  }

  async create(data: Omit<Briefing, 'id' | 'submittedAt'>): Promise<Briefing> {
    const id = crypto.randomUUID();
    const briefing: Briefing = { ...data, id, submittedAt: new Date().toISOString() };

    // Write full file FIRST (ensure dir exists)
    await fs.mkdir(this.briefingsDir, { recursive: true });
    await fs.writeFile(this.briefingFilePath(id), JSON.stringify(briefing, null, 2), 'utf-8');

    // Only then update index
    const release = await this.indexMutex.acquire();
    try {
      const index = await this.readIndex();
      const entry: BriefingIndex = {
        id,
        businessName: briefing.businessName,
        industry: briefing.industry,
        location: briefing.location,
        overallScore: briefing.overallScore,
        submittedAt: briefing.submittedAt,
        isGeminiLive: briefing.isGeminiLive,
        prospectId: briefing.prospectId,
      };
      await this.writeIndex([entry, ...index]);
    } finally {
      release();
    }

    return briefing;
  }

  async findById(id: string): Promise<Briefing | null> {
    if (!validateUUID(id)) return null;
    const filePath = path.resolve(this.briefingsDir, `${id}.json`);
    if (!filePath.startsWith(path.resolve(this.briefingsDir))) return null;
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(raw) as Briefing;
    } catch {
      return null;
    }
  }

  async findAll(opts: ListOptions = {}): Promise<{ items: BriefingIndex[]; total: number }> {
    let items = await this.readIndex();

    if (opts.search) {
      const q = opts.search.toLowerCase();
      items = items.filter(
        (b) =>
          b.businessName.toLowerCase().includes(q) || b.industry.toLowerCase().includes(q),
      );
    }

    if (opts.dateFrom) {
      items = items.filter((b) => b.submittedAt >= opts.dateFrom!);
    }
    if (opts.dateTo) {
      items = items.filter((b) => b.submittedAt <= opts.dateTo!);
    }

    // Default: newest first
    const sortKey = (opts.sortBy as keyof BriefingIndex) ?? 'submittedAt';
    const asc = opts.sortOrder === 'asc';
    items.sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      if (av < bv) return asc ? -1 : 1;
      if (av > bv) return asc ? 1 : -1;
      return 0;
    });

    const total = items.length;
    const page = Math.max(1, opts.page ?? 1);
    const pageSize = Math.max(1, Math.min(100, opts.pageSize ?? 10));
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total };
  }

  async update(
    id: string,
    patch: Partial<Pick<Briefing, 'prospectId'>>,
  ): Promise<Briefing | null> {
    if (!validateUUID(id)) return null;
    const briefing = await this.findById(id);
    if (!briefing) return null;
    const updated = { ...briefing, ...patch };
    await fs.writeFile(this.briefingFilePath(id), JSON.stringify(updated, null, 2), 'utf-8');

    // Update index entry
    const release = await this.indexMutex.acquire();
    try {
      const index = await this.readIndex();
      const idx = index.findIndex((b) => b.id === id);
      if (idx !== -1) {
        index[idx] = { ...index[idx], prospectId: patch.prospectId };
        await this.writeIndex(index);
      }
    } finally {
      release();
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!validateUUID(id)) return;
    const filePath = path.resolve(this.briefingsDir, `${id}.json`);
    if (!filePath.startsWith(path.resolve(this.briefingsDir))) return;
    await fs.unlink(filePath).catch(() => {});

    const release = await this.indexMutex.acquire();
    try {
      const index = await this.readIndex();
      await this.writeIndex(index.filter((b) => b.id !== id));
    } finally {
      release();
    }
  }

  async reconcileIndex(): Promise<void> {
    let files: string[];
    try {
      files = await fs.readdir(this.briefingsDir);
    } catch {
      return;
    }

    const entries: BriefingIndex[] = [];
    for (const file of files) {
      if (!file.endsWith('.json') || file.endsWith('.tmp')) continue;
      try {
        const raw = await fs.readFile(path.join(this.briefingsDir, file), 'utf-8');
        const b = JSON.parse(raw) as Briefing;
        entries.push({
          id: b.id,
          businessName: b.businessName,
          industry: b.industry,
          location: b.location,
          overallScore: b.overallScore,
          submittedAt: b.submittedAt,
          isGeminiLive: b.isGeminiLive,
          prospectId: b.prospectId,
        });
      } catch {
        // Skip corrupt files
      }
    }
    // Newest first
    entries.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
    await this.writeIndex(entries);
    console.log(`[WHI] Briefing index reconciled: ${entries.length} entries.`);
  }
}

// Workaround: variable used only in create() to track index for size warning
let index: BriefingIndex[] = [];
