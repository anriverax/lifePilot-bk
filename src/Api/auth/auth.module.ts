import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CreateAuthHandler } from "./application/commands/create-auth.handler";
import { AuthController } from "./auth.controller";
import { UserRepository } from "./repositories/user.repository";
import { AuthRepository } from "./repositories/auth.repository";

const AuthCommand = [CreateAuthHandler];

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
