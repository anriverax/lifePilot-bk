import { Command } from "@nestjs/cqrs";
import { CreateAuthInput } from "../../domain/auth.entity";

export class CreateAuthCommand extends Command<void> {
  constructor(public readonly data: CreateAuthInput) {
    super();
  }
}
