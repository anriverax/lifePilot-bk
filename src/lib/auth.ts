import "dotenv/config";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { bearer, emailOTP } from "better-auth/plugins";
import { Logger } from "@nestjs/common";
import { getSharedRedisClient } from "@/services/redis/redis-singleton";
import { getSharedPrismaClient } from "@/services/prisma/prisma-singleton";
import { sendOTPEmail } from "@/lib/email";

const logger = new Logger("Auth");

const trustedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

export const auth = betterAuth({
  appName: "LifePilot",
  baseURL:
    process.env.BETTER_AUTH_URL ??
    process.env.CORS_ORIGINS ??
    `http://localhost:${process.env.PORT ?? 3001}`,
  basePath: "/api/session", // new
  trustedOrigins,
  secret: process.env.BETTER_AUTH_SECRET,
  user: {
    additionalFields: {
      lastLoginDate: {
        type: "string",
        required: false
      },
      roleId: {
        type: "number",
        required: true,
        defaultValue: 1
      }
    }
  },
  /** Prisma adapter — uses the shared singleton pool, no extra connection opened. */
  database: prismaAdapter(getSharedPrismaClient(), {
    provider: "postgresql"
  }),
  advanced: {
    database: {
      generateId: "serial"
    } // 👈 deja que Postgres genere el ID con autoincrement
  },

  /**
   * Redis secondary storage — uses the shared singleton client.
   * Session reads are served from Redis; writes persist to both Redis and the DB.
   */
  secondaryStorage: {
    get: async (key: string) => getSharedRedisClient().get(key),
    set: async (key: string, value: string, ttl?: number) => {
      if (ttl) {
        await getSharedRedisClient().set(key, value, "EX", ttl);
      } else {
        await getSharedRedisClient().set(key, value);
      }
    },
    delete: async (key: string) => {
      await getSharedRedisClient().del(key);
    }
  },

  session: {
    /** Persist sessions to the DB (Session table) for active-session visibility. */
    storeSessionInDatabase: true,
    /** Session lifetime: 7 days. */
    expiresIn: 60 * 60 * 24 * 7,
    /** Refresh sliding window: update session if older than 1 day. */
    updateAge: 60 * 60 * 24,
    /** Cookie-cache reduces DB reads on every request. */
    cookieCache: {
      enabled: true,
      maxAge: 300 // 5 minutes
    }
  },

  emailAndPassword: {
    enabled: true,
    /** Require OTP email verification before the account can be used. */
    requireEmailVerification: true,
    autoSignIn: false,
    revokeSessionsOnPasswordReset: true
  },

  plugins: [
    /**
     * Bearer plugin: lets API clients authenticate with
     *   Authorization: Bearer <session-token>
     * instead of cookies — the stateless API equivalent of JWT.
     */
    bearer(),

    /**
     * Email OTP plugin:
     *  - sign-up: sends an OTP to confirm email ownership before the account is active.
     *  - sign-in: sends an OTP as a second-step verification before completing login.
     *  - forget-password / change-email: OTP-gated flows.
     */
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      allowedAttempts: 3,
      storeOTP: "hashed",
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        logger.log(`Sending OTP to ${email} [type=${type}]`);
        await sendOTPEmail({ to: email, otp, type });
      }
    })
  ]
});
