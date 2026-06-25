import { Body, Controller, Get, Post, Query, Session } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateEventCommand } from "./application/commands/create-event.command";
import { EventDto, GetCalendarEventsDto } from "./application/event.dto";
import { NestResponse } from "@/common/helpers/types";
import { UserSession } from "@thallesp/nestjs-better-auth";
import { EventEntity } from "./domain/event.entity";
import { GetCalendarEventsQuery } from "./application/queries/get-calendar-events.query";

@Controller("/events")
export class EventController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

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

  @Get("calendar")
  async getCalendarEvents(
    @Query() filters: GetCalendarEventsDto,
    @Session() session: UserSession
  ): Promise<NestResponse<EventEntity[]>> {
    const result = await this.queryBus.execute(
      new GetCalendarEventsQuery(parseInt(session.user.id), filters.startDate, filters.endDate)
    );

    return {
      message: "Eventos del calendario obtenidos con éxito.",
      data: result
    };
  }
}
