import { Query } from "@nestjs/cqrs";
import { EventEntity } from "../../domain/event.entity";

export class GetCalendarEventsQuery extends Query<EventEntity[]> {
  constructor(
    public readonly userId: number,
    public readonly startDate?: string,
    public readonly endDate?: string
  ) {
    super();
  }
}
