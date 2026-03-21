import { DynamicModule, Global, Logger, Module, OnApplicationShutdown } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { REDIS_CLIENT } from "./redis.core";
import { closeSharedRedisClient, getSharedRedisClient } from "./redis-singleton";

/**
 * Módulo global de Redis para NestJS.
 * Registra el cliente compartido de Redis y el RedisService como proveedores globales,
 * de modo que cualquier módulo de la aplicación pueda acceder a ellos sin importarlos
 * individualmente. Además, se encarga de cerrar la conexión con Redis al apagar la aplicación.
 */
@Global()
@Module({})
/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type */
export class RedisModule implements OnApplicationShutdown {
  private readonly logger = new Logger("RedisModule");

  /**
   * Registra el módulo de Redis con el cliente compartido como proveedor global.
   * Debe invocarse en el módulo raíz de la aplicación (`AppModule`).
   * @returns Un `DynamicModule` con los proveedores y exportaciones necesarios.
   */
  public static forRoot(): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        RedisService,
        {
          // Registra el cliente Redis compartido bajo el token REDIS_CLIENT
          // para que pueda ser inyectado en otros servicios mediante @InjectRedis().
          provide: REDIS_CLIENT,
          useValue: getSharedRedisClient()
        }
      ],
      exports: [REDIS_CLIENT, RedisService]
    };
  }

  /**
   * Se ejecuta automáticamente cuando NestJS inicia el proceso de apagado de la aplicación.
   * Cierra la conexión con Redis de forma ordenada para liberar recursos.
   */
  async onApplicationShutdown() {
    try {
      await closeSharedRedisClient();
      this.logger.log("✅ La conexión con Redis se ha cerrado correctamente.");
    } catch (error) {
      this.logger.error("❌ Se produjo un error al intentar cerrar la conexión con Redis.", error);
    }
  }
}
