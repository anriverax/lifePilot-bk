import { Body, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { NestResponse } from "@/common/helpers/types";
import { AuthDto } from "./application/auth.dto";
import { CreateAuthCommand } from "./application/commands/create-auth.command";

export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}
  @Post("register")
  async register(@Body() data: AuthDto): Promise<NestResponse<{ id: number }>> {
    // Implement registration logic here, e.g.:
    const userId = await this.commandBus.execute(new CreateAuthCommand(data));
    console.log(userId);
    return {
      statusCode: 200,
      message:
        "Registro exitoso. Se ha enviado un correo de verificación a su dirección de correo electrónico. Por favor, revise su bandeja de entrada y siga las instrucciones para completar el proceso."
    };
  }
}
