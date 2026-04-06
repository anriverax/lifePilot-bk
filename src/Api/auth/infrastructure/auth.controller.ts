import { Body, Post } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { AuthDto } from "../application/auth.dto";

export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}
  @Post("register")
  async register(@Body() data: AuthDto): Promise<{ id: number }> {
    // Implement registration logic here, e.g.:
    // const userId = await this.commandBus.execute(new RegisterUserCommand(dto));
    // return { id: userId };
    return { id: 1 }; // Placeholder response
  }
}
