import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma } from "@prisma/client";
import { Pool, PoolConfig } from "pg";

interface CreatePrismaClientFactoryParams {
  connectionString?: string;
  nodeEnv?: string;
}

const createSslConfig = (nodeEnv?: string): PoolConfig["ssl"] => {
  return nodeEnv === "production" ? { rejectUnauthorized: false } : false;
};

export const createPrismaPool = ({
  connectionString,
  nodeEnv
}: CreatePrismaClientFactoryParams): Pool => {
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize Prisma client");
  }

  return new Pool({
    connectionString,
    ssl: createSslConfig(nodeEnv)
  });
};

export const createPrismaClientOptions = (pool: Pool): Prisma.PrismaClientOptions => {
  return {
    adapter: new PrismaPg(pool)
  };
};

export const createPrismaClientFactory = ({
  connectionString,
  nodeEnv
}: CreatePrismaClientFactoryParams): { pool: Pool; clientOptions: Prisma.PrismaClientOptions } => {
  const pool = createPrismaPool({ connectionString, nodeEnv });

  return {
    pool,
    clientOptions: createPrismaClientOptions(pool)
  };
};
