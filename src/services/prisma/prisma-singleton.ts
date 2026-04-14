import { PrismaClient } from "@/prisma/generated/client";
import { Pool } from "pg";
import { createPrismaClientOptions, createPrismaPool } from "./prisma-client.factory";

let _pool: Pool | null = null;
let _client: PrismaClient | null = null;

/**
 * Models that support soft delete. Register model names here to enable automatic
 * filtering by `deletedAt` on read/update operations.
 */
export const modelsWithSoftDelete: string[] = [];

/**
 * Returns the shared pg Pool, creating it lazily on first call.
 * Used by both PrismaService (NestJS DI) and Better Auth adapter so only one
 * connection pool is maintained throughout the application lifecycle.
 */
export function getSharedPrismaPool(): Pool {
  if (!_pool) {
    _pool = createPrismaPool({
      connectionString: process.env.DATABASE_URL!,
      nodeEnv: process.env.NODE_ENV
    });
  }
  return _pool;
}

/**
 * Applies soft delete middleware extensions to a PrismaClient instance.
 * Filters read operations and guards update operations for models in modelsWithSoftDelete.
 */
function extendPrismaClientWithSoftDelete<T extends PrismaClient>(client: T): T {
  return client.$extends({
    query: {
      $allModels: {
        $allOperations({ model, operation, args, query }) {
          const operationsToFilter = [
            "findUnique",
            "findFirst",
            "findMany",
            "count",
            "aggregate",
            "groupBy"
          ];

          if (modelsWithSoftDelete.includes(model) && operationsToFilter.includes(operation)) {
            const typedArgs = args as Record<string, unknown>;
            if (typeof typedArgs === "object" && typedArgs !== null) {
              typedArgs["where"] ??= {};
              const where = typedArgs["where"] as Record<string, unknown>;
              if (!("deletedAt" in where)) {
                where.deletedAt = null;
              }
            }
          }
          return query(args);
        },
        async update({ model, args, query }) {
          if (modelsWithSoftDelete.includes(model)) {
            const typedArgs = args as Record<string, unknown>;
            if (
              typeof typedArgs === "object" &&
              typedArgs !== null &&
              "where" in typedArgs &&
              typeof typedArgs.where === "object"
            ) {
              typedArgs.where ??= {};
              const where = typedArgs.where as Record<string, unknown>;
              if (!("deletedAt" in where)) {
                where["deletedAt"] = null;
              }
            }
          }
          return query(args);
        }
      }
    }
  }) as T;
}

/**
 * Returns the shared PrismaClient with soft delete extensions.
 * Used by Better Auth, PrismaService, and other services that need DB access.
 * Creates instance lazily on first call to ensure single connection pool.
 */
export function getSharedPrismaClient(): PrismaClient {
  if (!_client) {
    const pool = getSharedPrismaPool();
    const options = createPrismaClientOptions(pool) as any;
    const client = new PrismaClient(options);
    _client = extendPrismaClientWithSoftDelete(client);
  }
  return _client;
}

/**
 * Closes the shared pg Pool. Should only be called during application shutdown.
 */
export async function closeSharedPrismaPool(): Promise<void> {
  if (_client) {
    await _client.$disconnect();
    _client = null;
  }

  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}
