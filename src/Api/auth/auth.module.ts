import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CreateUserHandler } from "./application/commands/create-user/create-user.handler";
import { AuthController } from "./auth.controller";
import { UserRepository } from "./repositories/user.repository";
import { AuthRepository } from "./repositories/auth.repository";
import { VerifyEmailHandler } from "./application/commands/verify-email/verify-email.handler";
import { AuthHandler } from "./application/commands/auth/auth.handler";
import { ChangePasswordHandler } from "./application/commands/change-password/change-password.handler";
import { RequestLoginOtpHandler } from "./application/commands/request-login-otp/request-login-otp.handler";
import { LoginWithOtpHandler } from "./application/commands/login-with-otp/login-with-otp.handler";
import { LogoutHandler } from "./application/commands/logout/logout.handler";
import { ResendCodeHandler } from "./application/commands/resend-code/resend-code.handler";
import { AuthorizationService } from "./services/authorization.service";
import { RolPermissionRepository } from "./repositories/rolPermission.repository";
import { ErrorHandlingModule } from "@/services/errorHandling/errorHandling.module";

const AuthCommand = [
  CreateUserHandler,
  VerifyEmailHandler,
  AuthHandler,
  ChangePasswordHandler,
  RequestLoginOtpHandler,
  LoginWithOtpHandler,
  LogoutHandler,
  ResendCodeHandler
];

const AuthReposity = [UserRepository, AuthRepository, RolPermissionRepository];
// Módulo de NestJS para autenticación.
@Module({
  // Importa los módulos necesarios para la autenticación, como JwtModule.
  imports: [CqrsModule, ErrorHandlingModule],
  // Controladores que manejan solicitudes HTTP relacionadas con la autenticación.
  controllers: [AuthController],
  // Proveedores para servicios y guardas utilizados en el módulo de autenticación.
  providers: [...AuthReposity, ...AuthCommand, AuthorizationService],
  exports: [AuthorizationService]
})
export class AuthModule {}
