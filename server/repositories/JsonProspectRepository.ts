import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import type {
  Prospect,
  ProspectIndex,
  ProspectRepository,
  ListOptions,
} from './interfaces.js';

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

export class JsonProspectRepository implements ProspectRepository {
  private readonly prospectsDir: string;
  private readonly indexFile: string;
  private readonly indexMutex = new AsyncMutex();

  constructor(dataPath: string) {
    this.prospectsDir = path.join(dataPath, 'prospects');
    this.indexFile = path.join(dataPath, '_index', 'prospects.json');
    Promise.all([
      ensureDir(this.prospectsDir),
      ensureDir(path.join(dataPath, '_index')),
    ]).catch(() => {});
  }

  private async readIndex(): Promise<ProspectIndex[]> {
    try {
      const raw = await fs.readFile(this.indexFile, 'utf-8');
      return JSON.parse(raw) as ProspectIndex[];
    } catch {
      return [];
    }
  }

  private async writeIndex(items: ProspectIndex[]): Promise<void> {
    await atomicWrite(this.indexFile, JSON.stringify(items, null, 2));
  }

  private prospectFilePath(id: string): string {
    return path.join(this.prospectsDir, `${id}.json`);
  }

  async create(data: Omit<Prospect, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prospect> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const prospect: Prospect = { ...data, id, createdAt: now, updatedAt: now };

    await fs.mkdir(this.prospectsDir, { recursive: true });
    await fs.writeFile(this.prospectFilePath(id), JSON.stringify(prospect, null, 2), 'utf-8');

    const release = await this.indexMutex.acquire();
    try {
      const index = await this.readIndex();
      const entry: ProspectIndex = {
        id,
        name: prospect.name,
        email: prospect.email,
        briefingId: prospect.briefingId,
        status: prospect.status,
        assignedTo: prospect.assignedTo,
        createdAt: now,
        updatedAt: now,
      };
      await this.writeIndex([entry, ...index]);
    } finally {
      release();
    }

    return prospect;
  }

  async findById(id: string): Promise<Prospect | null> {
    if (!validateUUID(id)) return null;
    const filePath = path.resolve(this.prospectsDir, `${id}.json`);
    if (!filePath.startsWith(path.resolve(this.prospectsDir))) return null;
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(raw) as Prospect;
    } catch {
      return null;
    }
  }

  async findAll(opts: ListOptions = {}): Promise<{ items: ProspectIndex[]; total: number }> {
    let items = await this.readIndex();

    if (opts.status) {
      items = items.filter((p) => p.status === opts.status);
    }

    if (opts.search) {
      const q = opts.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (p.businessName ?? '').toLowerCase().includes(q),
      );
    }

    if (opts.dateFrom) {
      items = items.filter((p) => p.createdAt >= opts.dateFrom!);
    }
    if (opts.dateTo) {
      items = items.filter((p) => p.createdAt <= opts.dateTo!);
    }

    const sortKey = (opts.sortBy as keyof ProspectIndex) ?? 'createdAt';
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
    patch: Partial<Pick<Prospect, 'status' | 'notes' | 'assignedTo' | 'briefingId'>>,
  ): Promise<Prospect | null> {
    if (!validateUUID(id)) return null;
    const prospect = await this.findById(id);
    if (!prospect) return null;

    const updated: Prospect = {
      ...prospect,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(
      this.prospectFilePath(id),
      JSON.stringify(updated, null, 2),
      'utf-8',
    );

    const release = await this.indexMutex.acquire();
    try {
      const index = await this.readIndex();
      const idx = index.findIndex((p) => p.id === id);
      if (idx !== -1) {
        index[idx] = {
          ...index[idx],
          status: updated.status,
          assignedTo: updated.assignedTo,
          briefingId: updated.briefingId,
          updatedAt: updated.updatedAt,
        };
        await this.writeIndex(index);
      }
    } finally {
      release();
    }

    return updated;
  }

  async reconcileIndex(): Promise<void> {
    let files: string[];
    try {
      files = await fs.readdir(this.prospectsDir);
    } catch {
      return;
    }

    const entries: ProspectIndex[] = [];
    for (const file of files) {
      if (!file.endsWith('.json') || file.endsWith('.tmp')) continue;
      try {
        const raw = await fs.readFile(path.join(this.prospectsDir, file), 'utf-8');
        const p = JSON.parse(raw) as Prospect;
        entries.push({
          id: p.id,
          name: p.name,
          email: p.email,
          briefingId: p.briefingId,
          status: p.status,
          assignedTo: p.assignedTo,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        });
      } catch {
        // Skip corrupt files
      }
    }
    entries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    await this.writeIndex(entries);
    console.log(`[WHI] Prospect index reconciled: ${entries.length} entries.`);
  }
}
