import { Body, Controller, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { AuthDto } from "./application/auth.dto";
import { CreateAuthCommand } from "./application/commands/create-auth.command";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { auth } from "@/lib/auth";
@Controller("/auth")
@AllowAnonymous()
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}
  @Post("register")
  async register(@Body() data: AuthDto): Promise<{ id: number }> {
    // Implement registration logic here, e.g.:

    const userId = await this.commandBus.execute(new CreateAuthCommand(data));

    return { id: userId.id };
  }

  @Post("verify-email")
  async verifyEmail(@Body() { token }: { token: string }): Promise<any> {
    // Implement email verification logic here, e.g.:
    // await this.commandBus.execute(new VerifyEmailCommand(token));
    console.log("Received email verification token:", token);
    const data = await auth.api.verifyEmailOTP({
      body: {
        email: "anriverax@gmail.com",
        otp: token
      }
    });
    return {
      statusCode: 200,
      message: "Correo electrónico verificado exitosamente.",
      data
    };
  }
}
