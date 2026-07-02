import { Query } from "@nestjs/cqrs";
import { EventEntity } from "../../domain/event.entity";

export class GetCalendarEventsQuery extends Query<EventEntity[]> {
  constructor(
    public readonly userId: number,
    public readonly currentDate?: string,
    public readonly month?: number,
    public readonly year?: number
  ) {
    super();
  }
}
