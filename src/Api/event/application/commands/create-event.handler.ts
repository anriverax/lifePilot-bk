import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateEventCommand } from "./create-event.command";
import { EventRepository } from "../../repositories/event.repository";

@CommandHandler(CreateEventCommand)
export class CreateEventHandler implements ICommandHandler<CreateEventCommand> {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(command: CreateEventCommand): Promise<{ id: number }> {
    return this.eventRepository.createEvent(command.data);
  }
}
