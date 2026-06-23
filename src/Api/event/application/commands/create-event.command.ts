import { Command } from "@nestjs/cqrs";
import { CreateEventInput } from "../../domain/event.entity";

export class CreateEventCommand extends Command<{ id: number }> {
  constructor(public readonly data: CreateEventInput) {
    super();
  }
}
