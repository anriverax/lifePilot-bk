import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { EventRepository } from "../../repositories/event.repository";
import { GetCalendarEventsQuery } from "./get-calendar-events.query";
import { EventEntity } from "../../domain/event.entity";

@QueryHandler(GetCalendarEventsQuery)
export class GetCalendarEventsHandler implements IQueryHandler<GetCalendarEventsQuery> {
  constructor(private readonly eventRepository: EventRepository) {}
  async execute(query: GetCalendarEventsQuery): Promise<EventEntity[]> {
    const { userId, startDate, endDate } = query;
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();

    return this.eventRepository.findByDateRange(start, end, Number(userId));
  }
}
