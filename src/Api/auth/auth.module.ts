import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CreateUserHandler } from "./application/commands/create-user/create-user.handler";
import { AuthController } from "./auth.controller";
import { UserRepository } from "./repositories/user.repository";
import { AuthRepository } from "./repositories/auth.repository";
import { VerifyEmailHandler } from "./application/commands/verify-email/verify-email.handler";

const AuthCommand = [CreateUserHandler, VerifyEmailHandler];

const AuthReposity = [UserRepository, AuthRepository];
// Módulo de NestJS para autenticación.
@Module({
  // Importa los módulos necesarios para la autenticación, como JwtModule.
  imports: [CqrsModule],
  // Controladores que manejan solicitudes HTTP relacionadas con la autenticación.
  controllers: [AuthController],
  // Proveedores para servicios y guardas utilizados en el módulo de autenticación.
  providers: [...AuthReposity, ...AuthCommand]
})
export class AuthModule {}
