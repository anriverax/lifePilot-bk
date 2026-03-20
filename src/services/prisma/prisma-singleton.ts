import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { createPrismaClientOptions, createPrismaPool } from "./prisma-client.factory";

let _pool: Pool | null = null;
let _client: PrismaClient | null = null;

/**
 * Returns the shared pg Pool, creating it lazily on first call.
 * Used by both PrismaService (NestJS DI) and Better Auth adapter so only one
 * connection pool is maintained throughout the application lifecycle.
 */
export function getSharedPrismaPool(): Pool {
  if (!_pool) {
    _pool = createPrismaPool({
      connectionString: process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV
    });
  }
  return _pool;
}

/**
 * Returns the shared PrismaClient for use outside NestJS DI (e.g. Better Auth adapter).
 * NestJS services should inject PrismaService directly instead.
 */
export function getSharedPrismaClient(): PrismaClient {
  if (!_client) {
    const pool = getSharedPrismaPool();
    _client = new PrismaClient(createPrismaClientOptions(pool));
  }
  return _client;
}

/**
 * Closes the shared pg Pool. Should only be called during application shutdown.
 */
export async function closeSharedPrismaPool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
    _client = null;
  }
}
