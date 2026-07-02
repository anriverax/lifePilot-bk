import { PrismaService } from "@/services/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateEventInput, EventEntity } from "../domain/event.entity";
import { State } from "@/prisma/generated/enums";

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}
  async createEvent(data: CreateEventInput): Promise<{ id: number }> {
    const event = await this.prisma.event.create({
      data: { ...data, state: State.NO_INICIADO },
      select: {
        id: true
      }
    });

    return event;
  }

  async findByDateRange(startDate: Date, endDate: Date, userId: number): Promise<EventEntity[]> {
    return this.prisma.event.findMany({
      where: {
        eventDateAndTime: { gte: startDate, lte: endDate },
        createdBy: userId
      },
      select: {
        id: true,
        title: true,
        eventDateAndTime: true,
        isReminder: true,
        eventType: true,
        priority: true,
        locationName: true,
        locationAddress: true,
        locationLat: true,
        locationLng: true,
        state: true
      },
      orderBy: { eventDateAndTime: "asc" }
    });
  }
}
