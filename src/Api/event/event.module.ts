import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { ErrorHandlingModule } from "@/services/errorHandling/errorHandling.module";
import { EventController } from "./event.controller";
import { CreateEventHandler } from "./application/commands/create-event.handler";
import { EventRepository } from "./repositories/event.repository";
import { GetCalendarEventsHandler } from "./application/queries/get-calendar-events.handler";

const EventCommandHandlers = [CreateEventHandler];
const EventQueryHandlers = [GetCalendarEventsHandler];

@Module({
  imports: [CqrsModule, ErrorHandlingModule],
  controllers: [EventController],
  providers: [EventRepository, ...EventCommandHandlers, ...EventQueryHandlers]
})
export class EventModule {}
