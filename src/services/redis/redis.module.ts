import { DynamicModule, Global, Logger, Module, OnApplicationShutdown } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { createRedisClient, REDIS_CLIENT, RedisModuleOptions } from './redis.core';

@Global()
@Module({})
/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type */
export class RedisModule implements OnApplicationShutdown {
  private readonly logger = new Logger("RedisModule");
  private static client: ReturnType<typeof createRedisClient>;

  public static forRoot(options: RedisModuleOptions): DynamicModule {
    if (!options.config.url) {
      throw new Error("Se requiere la URL de Redis en la configuración de RedisModule.");
    }

    this.client = createRedisClient(options);

    return {
      module: RedisModule,
      providers: [
        RedisService,
        {
          provide: REDIS_CLIENT,
          useValue: this.client
        }
      ],
      exports: [REDIS_CLIENT, RedisService]
    };
  }

  async onApplicationShutdown() {
    if (RedisModule.client) {
      try {
        await RedisModule.client.quit();
        this.logger.log("✅ La conexión con Redis se ha cerrado correctamente.");
      } catch (error) {
        this.logger.error("❌ Se produjo un error al intentar cerrar la conexión con Redis.", error);
      }
    }
  }
}
