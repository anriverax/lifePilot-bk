import { Body, Controller, Post, Get, Request, UseInterceptors } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { CommandBus } from "@nestjs/cqrs";
import { Request as ExpressRequest } from "express";
import { UserDto } from "./application/user.dto";
import { AllowAnonymous, Session, UserSession } from "@thallesp/nestjs-better-auth";
import { VerifyEmailDto } from "./application/verify-email.dto";
import { VerifyEmailCommand } from "./application/commands/verify-email/verify-email.command";
import { CreateUserCommand } from "./application/commands/create-user/create-user.command";
import { AuthDto } from "./application/auth.dto";
import { DecryptBodyInterceptor } from "@/common/interceptors/decrypt-body.interceptor";
import { AuthCommand } from "./application/commands/auth/auth.command";
import { ChangePasswordCommand } from "./application/commands/change-password/change-password.command";
import { ChangePasswordDto } from "./application/change-password.dto";
import { AuthResponse } from "./domain/auth.entity";
import { RequestLoginOtpDto } from "./application/request-login-otp.dto";
import { RequestLoginOtpCommand } from "./application/commands/request-login-otp/request-login-otp.command";
import { LoginWithOtpDto } from "./application/login-with-otp.dto";
import { LoginWithOtpCommand } from "./application/commands/login-with-otp/login-with-otp.command";

@Controller("/auth")
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}
  @AllowAnonymous()
  @Post("register")
  async register(@Body() data: UserDto): Promise<boolean> {
    const userId = await this.commandBus.execute(new CreateUserCommand(data));

    return userId;
  }

  @AllowAnonymous()
  @Post("verify-email")
  async verifyEmail(@Body() data: VerifyEmailDto): Promise<boolean> {
    return await this.commandBus.execute(new VerifyEmailCommand(data));
  }

  @AllowAnonymous()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseInterceptors(DecryptBodyInterceptor)
  @Post("login")
  async login(@Body() data: AuthDto): Promise<{ message: string; data: AuthResponse }> {
    const authResponse = await this.commandBus.execute(new AuthCommand(data));

    return {
      message: "Inicio de sesión realizado con éxito.",
      data: authResponse
    };
  }

  @AllowAnonymous()
  @Throttle({ default: { limit: 3, ttl: 600000 } })
  @Post("login-otp/request")
  async requestLoginOtp(@Body() data: RequestLoginOtpDto): Promise<{ message: string; data: boolean }> {
    const requestResult = await this.commandBus.execute(new RequestLoginOtpCommand(data));

    return {
      message: "Si el correo existe, se ha enviado un código de acceso.",
      data: requestResult
    };
  }

  @AllowAnonymous()
  @Throttle({ default: { limit: 5, ttl: 600000 } })
  @Post("login-otp/verify")
  async loginWithOtp(@Body() data: LoginWithOtpDto): Promise<{ message: string; data: AuthResponse }> {
    const authResponse = await this.commandBus.execute(new LoginWithOtpCommand(data));

    return {
      message: "Inicio de sesión con código realizado con éxito.",
      data: authResponse
    };
  }

  @UseInterceptors(DecryptBodyInterceptor)
  @Post("change-password")
  async changePassword(
    @Request() req: ExpressRequest,
    @Body() data: ChangePasswordDto
  ): Promise<{ message: string; data: boolean }> {
    const changePasswordResponse = await this.commandBus.execute(
      new ChangePasswordCommand(data, req.headers)
    );

    return {
      message: "Contraseña actualizada con éxito.",
      data: changePasswordResponse
    };
  }

  @Get("profile")
  getProfile(@Session() session: UserSession) {
    // session.user  → datos del usuario autenticado
    // session.session → datos de la sesión (expira, token, etc.)
    return session.user;
  }
}
