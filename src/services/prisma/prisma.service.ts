import { Prisma, PrismaClient } from "@/prisma/generated/client";
import { firstCapitalLetter } from "@/common/helpers/functions";
import { closeSharedPrismaPool, getSharedPrismaClient, modelsWithSoftDelete } from "./prisma-singleton";

/**
 * Token tipado para inyectar el PrismaClient compartido con utilidades adicionales.
 */
export abstract class PrismaService extends PrismaClient {
  abstract softDelete<T extends keyof PrismaClient>(
    modelName: T,
    where: Prisma.Args<PrismaClient[T], "update">["where"],
    additionalData?: Prisma.Args<PrismaClient[T], "update">["data"]
  ): Promise<unknown>;

  abstract onModuleInit(): Promise<void>;

  abstract onModuleDestroy(): Promise<void>;
}

export function createPrismaService(): PrismaService {
  const client = getSharedPrismaClient() as PrismaService;

  client.softDelete = async function <T extends keyof PrismaClient>(
    modelName: T,
    where: Prisma.Args<PrismaClient[T], "update">["where"],
    additionalData?: Prisma.Args<PrismaClient[T], "update">["data"]
  ) {
    const delegate = client[modelName] as any;

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
  };

  client.onModuleInit = async function () {
    await client.$connect();
  };

  client.onModuleDestroy = async function () {
    await client.$disconnect();
    await closeSharedPrismaPool();
  };

  return client;
}
