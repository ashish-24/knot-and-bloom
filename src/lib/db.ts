import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || '';

  // If using Turso Cloud database (libsql:// or https://)
  if (dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://')) {
    const tursoUrl = process.env.TURSO_DATABASE_URL || dbUrl.split('?')[0];
    const tursoToken = process.env.TURSO_AUTH_TOKEN || (dbUrl.includes('authToken=') ? dbUrl.split('authToken=')[1] : '');

    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });

    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  // Standard local SQLite fallback
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
