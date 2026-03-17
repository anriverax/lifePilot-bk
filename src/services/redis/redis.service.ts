import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import Redis from "ioredis";
import { InjectRedis } from "./redis.decorator";

@Injectable()

/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type */
export class RedisService {
  private readonly logger = new Logger("RedisService");
  constructor(@InjectRedis() private readonly redis: Redis) {}

  get client(): Redis {
    return this.redis;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const val = typeof value === "string" ? value : JSON.stringify(value);
    try {
      if (ttl) {
        await this.redis.set(key, val, "EX", ttl);
      } else {
        await this.redis.set(key, val);
      }
    } catch (error) {
      this.logger.error(
        `❌ Se produjo un error al intentar establecer la clave "${key}" en Redis.`,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  async get<T = string>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value) {
        return typeof value === "string" ? (value as T) : (JSON.parse(value) as T);
      }

      return null;
    } catch (error) {
      this.logger.error(
        `❌ Se produjo un error al intentar obtener la clave "${key}" desde Redis.`,
        error
      );
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(
        `❌ Se produjo un error al intentar eliminar la clave "${key}" de Redis.`,
        error
      );
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result > 0;
    } catch (error) {
      this.logger.error(
        `❌ Se produjo un error al intentar verificar la existencia de la clave "${key}" en Redis.`,
        error
      );
      throw new InternalServerErrorException(
        "Ha ocurrido un error interno. Por favor, inténtelo más tarde."
      );
    }
  }

  async expire(key: string, ttl: number) {
    try {
      await this.redis.expire(key, ttl);
    } catch (error) {
      this.logger.error(
        `❌ Se produjo un error al intentar establecer el TTL para la clave "${key}" en Redis.`,
        error
      );
      throw new InternalServerErrorException(
        "Ha ocurrido un error interno. Por favor, inténtelo más tarde."
      );
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      this.logger.error(
        `❌ Se produjo un error al intentar buscar claves con el patrón "${pattern}" en Redis.`,
        error
      );
      throw new InternalServerErrorException(
        "Ha ocurrido un error interno. Por favor, inténtelo más tarde."
      );
    }
  }

  async scanKeys(pattern: string): Promise<string[]> {
    const found: string[] = [];
    let cursor = "0";

    try {
      do {
        const [nextCursor, batch] = await this.redis.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100 // procesa hasta 100 claves por iteración sin bloquear
        );
        cursor = nextCursor;
        found.push(...batch);
      } while (cursor !== "0");

      return found;
    } catch (error) {
      this.logger.error(
        `❌ Se produjo un error al intentar escanear claves con el patrón "${pattern}" en Redis.`,
        error
      );
      throw new InternalServerErrorException(
        "Ha ocurrido un error interno. Por favor, inténtelo más tarde."
      );
    }
  }

  async quit(): Promise<void> {
    await this.redis.quit();
  }
}
