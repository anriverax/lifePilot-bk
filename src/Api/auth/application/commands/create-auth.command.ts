import { Command } from "@nestjs/cqrs";
import { CreateAuthInput } from "../../domain/auth.entity";

export class CreateAuthCommand extends Command<{ id: number }> {
  constructor(public readonly data: CreateAuthInput) {
    super();
  }
}
