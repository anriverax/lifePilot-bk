import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { CqrsModule } from "@nestjs/cqrs";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HealthModule } from "./health/health.module";

// module - Services
import { PrismaModule } from "./services/prisma/prisma.module";
import { RedisModule } from "./services/redis/redis.module";
import config from "./config";
import { envValidationSchema } from "./config/env.validation";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "./lib/auth";

// module - Api
import { PersonModule } from "./api/person/person.module";
import { UserModule } from "./api/user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema: envValidationSchema
    }),
    CqrsModule,
    PrismaModule,
    AuthModule.forRoot({
      auth,
      enableRawBodyParser: true
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
    RedisModule.forRoot(),
    HealthModule,
    PersonModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
