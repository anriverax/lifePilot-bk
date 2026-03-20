import Redis from "ioredis";
import { Logger } from "@nestjs/common";

const logger = new Logger("RedisSingleton");

let _client: Redis | null = null;

/**
 * Returns the shared Redis client instance, creating it lazily on first call.
 * Both auth.ts (Better Auth) and RedisModule use this singleton so only one
 * connection is maintained throughout the application lifecycle.
 */
export function getSharedRedisClient(): Redis {
  if (!_client) {
    const url = process.env.REDIS ?? "redis://localhost:6379";
    _client = new Redis(url);
    _client.on("connect", () => logger.log("✅ Conexión con Redis establecida correctamente."));
    _client.on("error", (err) => logger.error("❌ No se pudo establecer conexión con Redis.", err));
    _client.on("close", () => logger.warn("⚠️ La conexión con Redis se ha cerrado."));
  }
  return _client;
}

/**
 * Closes the shared Redis client. Should only be called during application shutdown.
 */
export async function closeSharedRedisClient(): Promise<void> {
  if (_client) {
    await _client.quit();
    _client = null;
  }
}
