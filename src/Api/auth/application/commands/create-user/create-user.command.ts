import { CreateUserInput } from "@/api/auth/domain/auth.entity";
import { Command } from "@nestjs/cqrs";

export class CreateUserCommand extends Command<boolean> {
  constructor(public readonly data: CreateUserInput) {
    super();
  }
}
