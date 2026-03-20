import { prismaAdapter } from "@better-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { Logger } from "@nestjs/common";
import Redis from "ioredis";
import { createPrismaClientFactory } from "@/services/prisma/prisma-client.factory";

const logger = new Logger("Auth");

const { clientOptions } = createPrismaClientFactory({
  connectionString: process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV
});

const prisma = new PrismaClient(clientOptions);

const redis = new Redis(process.env.REDIS ?? "redis://localhost:6379");
redis.on("error", (err) => logger.error("❌ Redis connection error in auth module", err));

const trustedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

export const auth = betterAuth({
  appName: "LifePilot",
  baseURL:
    process.env.BETTER_AUTH_URL ??
    process.env.SERVER_URL ??
    `http://localhost:${process.env.PORT ?? 3001}`,
  trustedOrigins,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  /**
   * Redis is used as secondary (fast) storage for sessions.
   * Sessions are still persisted in the database (storeSessionInDatabase: true)
   * but reads are served from Redis for performance, replacing a manual JWT+Redis layer.
   */
  secondaryStorage: {
    get: async (key: string) => {
      return redis.get(key);
    },
    set: async (key: string, value: string, ttl?: number) => {
      if (ttl) {
        await redis.set(key, value, "EX", ttl);
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key: string) => {
      await redis.del(key);
    }
  },
  session: {
    storeSessionInDatabase: true,
    cookieCache: {
      enabled: true,
      maxAge: 300 // 5 minutes
    }
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    revokeSessionsOnPasswordReset: true,
    async sendVerificationEmail({ email, url }) {
      // TODO: integrate with email service (e.g. Resend via RESEND env var)
      logger.log(`Sending verification email to ${email}: ${url}`);
    }
  },
  /**
   * The bearer plugin lets API clients authenticate with
   *   Authorization: Bearer <session-token>
   * instead of cookies — the JWT-equivalent flow for stateless API access.
   */
  plugins: [bearer()]
});
