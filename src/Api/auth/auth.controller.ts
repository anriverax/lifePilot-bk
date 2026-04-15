import { Body, Controller, Post, UseInterceptors } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { UserDto } from "./application/user.dto";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { VerifyEmailDto } from "./application/verify-email.dto";
import { VerifyEmailCommand } from "./application/commands/verify-email/verify-email.command";
import { CreateUserCommand } from "./application/commands/create-user/create-user.command";
import { auth } from "@/lib/auth";
import { AuthDto } from "./application/auth.dto";
import { DecryptBodyInterceptor } from "@/common/interceptors/decrypt-body.interceptor";

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
  @UseInterceptors(DecryptBodyInterceptor)
  @Post("login")
  async login(@Body() data: AuthDto): Promise<any> {
    // Implementar lógica de inicio de sesión aquí
    return auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.passwd
      },
      asResponse: true
    });
  }
}
