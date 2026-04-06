import { Module } from "@nestjs/common";
import { CqrsModule, EventBus } from "@nestjs/cqrs";
import { CreateAuthHandler } from './application/commands/create-auth.handler';
import { AUTH_REPOSITORY } from './application/repositories/auth-repository.port';
import { PrismaAuthRepository } from './application/repositories/prisma-auth.repository';

const AuthCommand = [CreateAuthHandler];

const EventHandlers = [UserRegisteredHandler, PasswdChangedHandler];

const AuthProviders = [
  {
    provide: AUTH_REPOSITORY,
    useClass: PrismaAuthRepository
  }
];

/* eslint-disable @typescript-eslint/explicit-function-return-type */

// Módulo de NestJS para autenticación.
@Module({
  // Importa los módulos necesarios para la autenticación, como JwtModule.
  imports: [CqrsModule, JwtModule],
  // Controladores que manejan solicitudes HTTP relacionadas con la autenticación.
  controllers: [AuthController],
  // Proveedores para servicios y guardas utilizados en el módulo de autenticación.
  providers: [
    AuthService,
    TokenService,
    KeyService,
    RedisService,
    UserProjection,
    UserKeyProjection,
    EventStoreService,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    {
      provide: EventBusWithStore,
      useFactory: (eventBus: EventBus, eventStore: EventStoreService) =>
        new EventBusWithStore(eventBus, eventStore),
      inject: [EventBus, EventStoreService]
    }
  ]
})
export class AuthModule {}
