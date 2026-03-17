import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HealthModule } from "./health/health.module";

// module - Services
import { PrismaModule } from "./services/prisma/prisma.module";
import { RedisModule } from "./services/redis/redis.module";
import config from './config';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema: envValidationSchema
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>("THROTTLE_TTL", 60000),
          limit: config.get<number>("THROTTLE_LIMIT", 100)
        }
      ]
    }),
    PrismaModule,
    RedisModule.forRoot({
      config: {
        url: process.env.REDIS
      }
    }),
    HealthModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
