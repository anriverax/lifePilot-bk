import { Body, Post } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { AuthDto } from "../application/auth.dto";
import { NestResponse } from "@/common/helpers/types";

export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}
  @Post("register")
  async register(@Body() data: AuthDto): Promise<NestResponse<{ id: number }>> {
    // Implement registration logic here, e.g.:
    // const userId = await this.commandBus.execute(new RegisterUserCommand(dto));
    // return { id: userId };
    return {
      statusCode: 200,
      message:
        "Registro exitoso. Se ha enviado un correo de verificación a su dirección de correo electrónico. Por favor, revise su bandeja de entrada y siga las instrucciones para completar el proceso."
    };
  }
}
