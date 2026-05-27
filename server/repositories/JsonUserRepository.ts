import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import type { User, UserPublic, UserRepository } from './interfaces.js';

// ─── Mutex for atomic users.json writes ──────────────────────────────────────

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

export class JsonUserRepository implements UserRepository {
  private readonly usersFile: string;
  private readonly mutex = new AsyncMutex();

  constructor(dataPath: string) {
    const usersDir = path.join(dataPath, 'users');
    this.usersFile = path.join(usersDir, 'users.json');
    ensureDir(usersDir).catch(() => {});
  }

  private async readUsers(): Promise<User[]> {
    try {
      const raw = await fs.readFile(this.usersFile, 'utf-8');
      return JSON.parse(raw) as User[];
    } catch {
      return [];
    }
  }

  /** Internal use only — exposes full User records for auth token scanning */
  async findAllRaw(): Promise<User[]> {
    return this.readUsers();
  }

  private async writeUsers(users: User[]): Promise<void> {
    await atomicWrite(this.usersFile, JSON.stringify(users, null, 2));
  }

  async hasAdminUser(): Promise<boolean> {
    const users = await this.readUsers();
    return users.some((u) => u.role === 'admin');
  }

  async findById(id: string): Promise<User | null> {
    const users = await this.readUsers();
    return users.find((u) => u.id === id) ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const users = await this.readUsers();
    return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) ?? null;
  }

  async findAll(): Promise<UserPublic[]> {
    const users = await this.readUsers();
    return users.map(toPublic);
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const release = await this.mutex.acquire();
    try {
      const users = await this.readUsers();
      const now = new Date().toISOString();
      const user: User = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      await this.writeUsers([...users, user]);
      return user;
    } finally {
      release();
    }
  }

  async update(id: string, patch: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const release = await this.mutex.acquire();
    try {
      const users = await this.readUsers();
      const idx = users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      const updated: User = { ...users[idx], ...patch, updatedAt: new Date().toISOString() };
      users[idx] = updated;
      await this.writeUsers(users);
      return updated;
    } finally {
      release();
    }
  }
}

function toPublic(u: User): UserPublic {
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    requirePasswordChange: u.requirePasswordChange,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}
