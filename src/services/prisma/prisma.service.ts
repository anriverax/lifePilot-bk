import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "@/prisma/generated/client";
import { firstCapitalLetter } from "@/common/helpers/functions";
import { closeSharedPrismaPool, getSharedPrismaClient, modelsWithSoftDelete } from "./prisma-singleton";

/**
 * NestJS service that exposes the shared PrismaClient with soft delete extensions.
 * Ensures a single connection pool is maintained throughout the application lifecycle.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: PrismaClient;

  constructor() {
    // Get the shared client which already has soft delete extensions applied
    this.client = getSharedPrismaClient();
  }

  /**
   * Expose the underlying PrismaClient for direct access when needed.
   */
  get prisma(): PrismaClient {
    return this.client;
  }

  /**
   * Proxy access to all Prisma models and methods
   */
  get user() {
    return this.client.user;
  }

  get person() {
    return this.client.person;
  }

  get session() {
    return this.client.session;
  }

  get account() {
    return this.client.account;
  }

  get verification() {
    return this.client.verification;
  }

  /**
   * Expose transaction method
   */
  $transaction = (queries: any) => this.client.$transaction(queries);

  /**
   * Expose raw query method
   */
  $queryRaw = (query: any, ...values: any[]) => this.client.$queryRaw(query, ...values);

  /**
   * Expose executeRaw method
   */
  $executeRaw = (query: any, ...values: any[]) => this.client.$executeRaw(query, ...values);

  /**
   * Performs soft delete by setting `deletedAt` to current timestamp for the matching record.
   * @param modelName - The Prisma model name to soft delete from.
   * @param where - Filter clause identifying the record to delete.
   * @param additionalData - Extra data to include in the update operation.
   * @throws {Error} If model doesn't exist, doesn't support updates, isn't configured for soft delete, or where clause is invalid/empty.
   */
  async softDelete<T extends keyof PrismaClient>(
    modelName: T,
    where: Prisma.Args<PrismaClient[T], "update">["where"],
    additionalData?: Prisma.Args<PrismaClient[T], "update">["data"]
  ) {
    const delegate = this.client[modelName] as any;

    if (typeof delegate !== "object" || typeof delegate.update !== "function") {
      throw new Error(`Model ${String(modelName)} not found or does not support update operations.`);
    }

    if (!modelsWithSoftDelete.includes(firstCapitalLetter(String(modelName)))) {
      throw new Error(`Model ${String(modelName)} does not support soft deletion.`);
    }

    if (!where || Object.keys(where).length === 0) {
      throw new Error(`Missing or invalid where clause for ${String(modelName)}.`);
    }

    const data = {
      ...additionalData,
      deletedAt: new Date()
    };

    return delegate.update({ where, data });
  }

  /**
   * Called automatically when NestJS initializes the module.
   */
  async onModuleInit() {
    await this.client.$connect();
  }

  /**
   * Called automatically when NestJS destroys the module.
   * Disconnects the shared connection pool.
   */
  async onModuleDestroy() {
    await this.client.$disconnect();
    await closeSharedPrismaPool();
  }
}
