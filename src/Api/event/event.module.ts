import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { ErrorHandlingModule } from "@/services/errorHandling/errorHandling.module";
import { EventController } from "./event.controller";
import { CreateEventHandler } from "./application/commands/create-event.handler";
import { EventRepository } from "./repositories/event.repository";

const EventCommand = [CreateEventHandler];

@Module({
  imports: [CqrsModule, ErrorHandlingModule],
  controllers: [EventController],
  providers: [EventRepository, ...EventCommand]
})
export class EventModule {}
