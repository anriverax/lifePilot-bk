import { DynamicModule, Global, Logger, Module, OnApplicationShutdown } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { REDIS_CLIENT } from "./redis.core";
import { closeSharedRedisClient, getSharedRedisClient } from "./redis-singleton";

@Global()
@Module({})
/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type */
export class RedisModule implements OnApplicationShutdown {
  private readonly logger = new Logger("RedisModule");

  public static forRoot(): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        RedisService,
        {
          provide: REDIS_CLIENT,
          useValue: getSharedRedisClient()
        }
      ],
      exports: [REDIS_CLIENT, RedisService]
    };
  }

  async onApplicationShutdown() {
    try {
      await closeSharedRedisClient();
      this.logger.log("✅ La conexión con Redis se ha cerrado correctamente.");
    } catch (error) {
      this.logger.error("❌ Se produjo un error al intentar cerrar la conexión con Redis.", error);
    }
  }
}
