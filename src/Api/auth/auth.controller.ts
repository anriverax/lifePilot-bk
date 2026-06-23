import { Body, Controller, Post, Get, Request } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { CommandBus } from "@nestjs/cqrs";
import { Request as ExpressRequest } from "express";
import { UserDto } from "./application/user.dto";
import { AllowAnonymous, Session, UserSession } from "@thallesp/nestjs-better-auth";
import { VerifyEmailDto } from "./application/verify-email.dto";
import { VerifyEmailCommand } from "./application/commands/verify-email/verify-email.command";
import { CreateUserCommand } from "./application/commands/create-user/create-user.command";
import { AuthDto } from "./application/auth.dto";
import { AuthCommand } from "./application/commands/auth/auth.command";
import { ChangePasswordCommand } from "./application/commands/change-password/change-password.command";
import { ChangePasswordDto } from "./application/change-password.dto";
import { AuthResponse, BootstrapResponse, ProfileResponse } from "./domain/auth.entity";
import { RequestLoginOtpDto } from "./application/request-login-otp.dto";
import { RequestLoginOtpCommand } from "./application/commands/request-login-otp/request-login-otp.command";
import { LoginWithOtpDto } from "./application/login-with-otp.dto";
import { LoginWithOtpCommand } from "./application/commands/login-with-otp/login-with-otp.command";
import { LogoutCommand } from "./application/commands/logout/logout.command";
import { AuthorizationService } from "@/api/auth/services/authorization.service";
import { ResendCodeDto } from "./application/resend-code.dto";
import { ResendCodeCommand } from "./application/commands/resend-code/resend-code.command";
import { NestResponse } from "@/common/helpers/types";

@Controller("/auth")
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authorizationService: AuthorizationService
  ) {}
  @AllowAnonymous()
  @Throttle({ default: { limit: 5, ttl: 600000 } })
  @Post("register")
  async register(@Body() data: UserDto): Promise<NestResponse<boolean>> {
    const registerResult = await this.commandBus.execute(new CreateUserCommand(data));

    return {
      message: "Cuenta creada con éxito. Revisa tu correo para verificarla.",
      data: registerResult
    };
  }

  @AllowAnonymous()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("login")
  async login(@Body() data: AuthDto): Promise<NestResponse<AuthResponse>> {
    const authResponse = await this.commandBus.execute(new AuthCommand(data));

    return {
      message: "Inicio de sesión realizado con éxito.",
      data: authResponse
    };
  }

  @AllowAnonymous()
  @Throttle({ default: { limit: 3, ttl: 600000 } })
  @Post("login-otp/request")
  async requestLoginOtp(@Body() data: RequestLoginOtpDto): Promise<NestResponse<boolean>> {
    const requestResult = await this.commandBus.execute(new RequestLoginOtpCommand(data));

    return {
      message: "Si el correo existe, se ha enviado un código de acceso.",
      data: requestResult
    };
  }

  @AllowAnonymous()
  @Throttle({ default: { limit: 3, ttl: 600000 } })
  @Post("login-otp/verify")
  async loginWithOtp(@Body() data: LoginWithOtpDto): Promise<NestResponse<AuthResponse>> {
    const authResponse = await this.commandBus.execute(new LoginWithOtpCommand(data));

    return {
      message: "Inicio de sesión con código realizado con éxito.",
      data: authResponse
    };
  }

  @AllowAnonymous()
  @Throttle({ default: { limit: 3, ttl: 86400000 } })
  @Post("verify-email")
  async verifyEmail(@Body() data: VerifyEmailDto): Promise<NestResponse<boolean>> {
    const verifyEmailResult = await this.commandBus.execute(new VerifyEmailCommand(data));

    return {
      message: "Correo verificado con éxito.",
      data: verifyEmailResult
    };
  }

  @AllowAnonymous()
  @Throttle({ default: { limit: 3, ttl: 86400000 } })
  @Post("resend-code")
  async resendCode(@Body() data: ResendCodeDto): Promise<NestResponse<boolean>> {
    const resendCodeResult = await this.commandBus.execute(new ResendCodeCommand(data));

    return {
      message: "Si el correo existe, se ha reenviado un código de verificación.",
      data: resendCodeResult
    };
  }

  @Post("change-password")
  async changePassword(
    @Request() req: ExpressRequest,
    @Body() data: ChangePasswordDto
  ): Promise<NestResponse<boolean>> {
    const changePasswordResponse = await this.commandBus.execute(
      new ChangePasswordCommand(data, req.headers)
    );

    return {
      message: "Contraseña actualizada con éxito.",
      data: changePasswordResponse
    };
  }

  @Post("logout")
  async logout(@Request() req: ExpressRequest): Promise<NestResponse<boolean>> {
    const logoutResponse = await this.commandBus.execute(new LogoutCommand(req.headers));

    return {
      message: "Sesión cerrada con éxito.",
      data: logoutResponse
    };
  }

  @Get("profile")
  async getProfile(@Session() session: UserSession): Promise<NestResponse<ProfileResponse>> {
    const snapshot = await this.authorizationService.getAuthorizationSnapshot(session.user.id);

    return {
      message: "Perfil obtenido con éxito.",
      data: {
        ...session.user,
        roleName: snapshot.roleName
      }
    };
  }

  @Get("bootstrap")
  async getBootstrap(@Session() session: UserSession): Promise<NestResponse<BootstrapResponse>> {
    const snapshot = await this.authorizationService.getAuthorizationSnapshot(session.user.id);

    return {
      message: "Datos iniciales obtenidos con éxito.",
      data: {
        user: session.user,
        roleName: snapshot.roleName,
        permissions: snapshot.permissions,
        menu: snapshot.menu
      }
    };
  }
}
