import { Body, Controller, Post, Session } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { CreateEventCommand } from "./application/commands/create-event.command";
import { EventDto } from "./application/event.dto";
import { NestResponse } from "@/common/helpers/types";
import { UserSession } from "@thallesp/nestjs-better-auth";

@Controller("/events")
export class EventController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async createEvent(
    @Body() data: EventDto,
    @Session() session: UserSession
  ): Promise<NestResponse<{ id: number }>> {
    // Aquí puedes ejecutar un comando para crear un evento
    const result = await this.commandBus.execute(
      new CreateEventCommand({ ...data, createdBy: parseInt(session.user.id) })
    );

    return {
      message: "Evento creado con éxito.",
      data: result
    };
  }
}
