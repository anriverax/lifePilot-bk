import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import Redis from "ioredis";
import { InjectRedis } from "./redis.decorator";

/**
 * Servicio de Redis para NestJS.
 * Proporciona métodos de alto nivel para interactuar con Redis,
 * incluyendo operaciones de lectura, escritura, eliminación y expiración de claves.
 * Todos los métodos incluyen manejo de errores con logging integrado.
 */
@Injectable()

/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type */
export class RedisService {
  private readonly logger = new Logger("RedisService");
  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Expone el cliente de Redis subyacente para operaciones avanzadas
   * que no están cubiertas por los métodos de este servicio.
   */
  get client(): Redis {
    return this.redis;
  }

  /**
   * Almacena un valor en Redis bajo la clave indicada.
   * Si se especifica un TTL, la clave expirará automáticamente tras los segundos indicados.
   * @param key - La clave bajo la que se almacenará el valor.
   * @param value - El valor a almacenar (se serializa a JSON si no es un string).
   * @param ttl - Tiempo de vida en segundos (opcional).
   * @throws Relanza el error original si la operación falla en Redis.
   */
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

  /**
   * Obtiene el valor asociado a la clave indicada en Redis.
   * Si el valor existe y es un string, se devuelve tal cual; de lo contrario
   * se intenta parsear como JSON.
   * @param key - La clave cuyo valor se desea recuperar.
   * @returns El valor asociado a la clave, o `null` si no existe.
   * @throws Relanza el error original si la operación falla en Redis.
   */
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

  /**
   * Elimina la clave indicada de Redis.
   * @param key - La clave que se desea eliminar.
   * @throws Relanza el error original si la operación falla en Redis.
   */
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

  /**
   * Comprueba si una clave existe en Redis.
   * @param key - La clave cuya existencia se desea verificar.
   * @returns `true` si la clave existe, `false` en caso contrario.
   * @throws {InternalServerErrorException} Si la operación falla en Redis.
   */
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

  /**
   * Establece el tiempo de vida (TTL) de una clave existente en Redis.
   * @param key - La clave a la que se le aplicará el TTL.
   * @param ttl - Tiempo de vida en segundos.
   * @throws {InternalServerErrorException} Si la operación falla en Redis.
   */
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

  /**
   * Devuelve todas las claves que coinciden con el patrón indicado.
   * @remarks
   * ⚠️ Este método puede bloquear Redis en bases de datos con muchas claves.
   * Para entornos de producción con grandes volúmenes de datos, se recomienda
   * usar `scanKeys` en su lugar.
   * @param pattern - El patrón glob para filtrar claves (ej. `"user:*"`).
   * @returns Un array con las claves que coinciden con el patrón.
   * @throws {InternalServerErrorException} Si la operación falla en Redis.
   */
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

  /**
   * Recorre de forma iterativa todas las claves de Redis que coinciden con el patrón dado
   * usando el comando SCAN, sin bloquear el servidor.
   * Procesa hasta 100 claves por iteración hasta agotar el cursor.
   * @param pattern - El patrón glob para filtrar claves (ej. `"session:*"`).
   * @returns Un array con todas las claves que coinciden con el patrón.
   * @throws {InternalServerErrorException} Si la operación falla en Redis.
   */
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

  /**
   * Cierra la conexión con Redis de forma ordenada.
   * Se recomienda llamar a este método durante el apagado de la aplicación.
   */
  async quit(): Promise<void> {
    await this.redis.quit();
  }
}
