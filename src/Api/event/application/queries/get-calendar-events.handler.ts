import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { EventRepository } from "../../repositories/event.repository";
import { GetCalendarEventsQuery } from "./get-calendar-events.query";
import { EventEntity } from "../../domain/event.entity";
import { BadRequestException } from "@nestjs/common";

@QueryHandler(GetCalendarEventsQuery)
export class GetCalendarEventsHandler implements IQueryHandler<GetCalendarEventsQuery> {
  constructor(private readonly eventRepository: EventRepository) {}
  async execute(query: GetCalendarEventsQuery): Promise<EventEntity[]> {
    const { startDate, endDate } = this.resolveDateRange(query);

    return this.eventRepository.findByDateRange(startDate, endDate, Number(query.userId));
  }

  private resolveDateRange(query: GetCalendarEventsQuery): { startDate: Date; endDate: Date } {
    if (query.month && query.year) {
      return this.buildMonthRange(query.month, query.year);
    }

    if (query.currentDate) {
      return this.buildSingleDayRange(query.currentDate);
    }

    throw new BadRequestException("Debe proporcionar 'currentDate', o 'month' y 'year'");
  }

  private buildSingleDayRange(currentDate: string): { startDate: Date; endDate: Date } {
    const startDate = new Date(`${currentDate}T00:00:00.000`);
    const endDate = new Date(`${currentDate}T23:59:59.999`);

    if (isNaN(startDate.getTime())) {
      throw new BadRequestException("'currentDate' no es una fecha válida");
    }

    return { startDate, endDate };
  }

  private buildMonthRange(month: number, year: number): { startDate: Date; endDate: Date } {
    // ✅ month es 1-indexed en la API (más natural para el cliente), pero Date usa 0-indexed
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // último día del mes, fin del día

    return { startDate, endDate };
  }
}
