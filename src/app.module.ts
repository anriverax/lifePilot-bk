import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { HealthModule } from "./health/health.module";

// module - Services
import { PrismaModule } from "./services/prisma/prisma.module";
import { RedisModule } from "./services/redis/redis.module";
import config from "./config";
import { envValidationSchema } from "./config/env.validation";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "./lib/auth";

// module - Api
import { AuthModule } from "./api/auth/auth.module";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";
import { SuccessResponseInterceptor } from "./common/interceptors/success-response.interceptor";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ErrorHandlingModule } from "./services/errorHandling/errorHandling.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema: envValidationSchema
    }),
    PrismaModule,
    BetterAuthModule.forRoot({
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
    ErrorHandlingModule,
    PrismaModule,
    RedisModule.forRoot(),
    HealthModule,
    AuthModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessResponseInterceptor
    }
  ]
})
export class AppModule {}
