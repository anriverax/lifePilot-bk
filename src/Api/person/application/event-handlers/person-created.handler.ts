/**
 * Person Created Event Handler
 * Reacts to PersonCreatedEvent domain event
 * Can be used for side effects like sending email, logging, etc.
 */

import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Injectable, Logger } from "@nestjs/common";
import { PersonCreatedEvent } from "../../domain/events/person-created.event";

@Injectable()
@EventsHandler(PersonCreatedEvent)
export class PersonCreatedHandler implements IEventHandler<PersonCreatedEvent> {
  private readonly logger = new Logger(PersonCreatedHandler.name);

  handle(event: PersonCreatedEvent): void {
    this.logger.debug(`Person created: ${event.firstName} ${event.lastName} (ID: ${event.personId})`);
    // Here you could:
    // - Send welcome email
    // - Update read models
    // - Trigger other processes
  }
}
