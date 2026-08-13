import 'dotenv/config';
import path from 'path';
import { PrismaClient } from '../generated/prisma/client.js';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function resolveDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL || 'file:./dev.db';
  if (raw.startsWith('file:')) {
    const filePath = raw.slice('file:'.length);
    if (path.isAbsolute(filePath)) return raw;
    return `file:${path.resolve(process.cwd(), filePath)}`;
  }
  return raw;
}

export function isPostgresUrl(url = resolveDatabaseUrl()): boolean {
  return /^postgres(ql)?:\/\//i.test(url);
}

async function createClient(): Promise<PrismaClient> {
  const url = resolveDatabaseUrl();

  if (isPostgresUrl(url)) {
    const [{ PrismaPg }, { default: pg }] = await Promise.all([
      import('@prisma/adapter-pg'),
      import('pg'),
    ]);
    const pool = new pg.Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }

  const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

// Eager singleton — created on first import via top-level await pattern for ESM
const prismaPromise = globalForPrisma.prisma
  ? Promise.resolve(globalForPrisma.prisma)
  : createClient().then((client) => {
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = client;
      }
      return client;
    });

/** Awaitable Prisma client (supports SQLite file: URLs and PostgreSQL). */
export const prisma: PrismaClient = await prismaPromise;
