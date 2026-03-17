import { Logger } from "@nestjs/common";
import Redis, { RedisOptions } from "ioredis";

export const REDIS_CLIENT = "REDIS_CLIENT";

export interface RedisModuleOptions {
  config: RedisOptions & { url?: string };
}

/**
 * Crea una conexión a Redis basada en las opciones de configuración proporcionadas.
 * @param config Las opciones de configuración para la conexión a Redis.
 * @returns Una instancia del cliente de Redis.
 */

/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type */

export function createRedisClient(options: RedisModuleOptions) {
  const logger = new Logger("RedisClient");

  const { config } = options;

  // Si se proporciona una URL en la configuración, úsala para establecer la conexión.
  // Si no se proporciona una URL, utiliza la conexión predeterminada de Redis.
  const client = config.url ? new Redis(config.url, config as RedisOptions) : new Redis(config);

  client.on("connect", () => logger.log("✅ Conexión con Redis establecida correctamente."));
  client.on("error", (err) => logger.error("❌ No se pudo establecer conexión con Redis.", err));
  client.on("close", () => logger.warn("⚠️ La conexión con Redis se ha cerrado."));

  return client;
}
