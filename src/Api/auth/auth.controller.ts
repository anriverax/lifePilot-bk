import { Body, Controller, Post, Get, UseInterceptors } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { CommandBus } from "@nestjs/cqrs";
import { UserDto } from "./application/user.dto";
import { AllowAnonymous, Session, UserSession } from "@thallesp/nestjs-better-auth";
import { VerifyEmailDto } from "./application/verify-email.dto";
import { VerifyEmailCommand } from "./application/commands/verify-email/verify-email.command";
import { CreateUserCommand } from "./application/commands/create-user/create-user.command";
import { AuthDto } from "./application/auth.dto";
import { DecryptBodyInterceptor } from "@/common/interceptors/decrypt-body.interceptor";
import { AuthCommand } from "./application/commands/auth/auth.command";

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
  async login(@Body() data: AuthDto): Promise<{ token: string; user: unknown }> {
    // Implementar lógica de inicio de sesión aquí
    return await this.commandBus.execute(new AuthCommand(data));
  }

  @Get("profile")
  getProfile(@Session() session: UserSession) {
    // session.user  → datos del usuario autenticado
    // session.session → datos de la sesión (expira, token, etc.)
    return session.user;
  }
}
