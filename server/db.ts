import 'dotenv/config';
import path from 'path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client.js';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function resolveDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL || 'file:./prisma/dev.db';
  if (raw.startsWith('file:')) {
    const filePath = raw.slice('file:'.length);
    if (path.isAbsolute(filePath)) return raw;
    return `file:${path.resolve(process.cwd(), filePath)}`;
  }
  return raw;
}

function createClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: resolveDatabaseUrl() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
