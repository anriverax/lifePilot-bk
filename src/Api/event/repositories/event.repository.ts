import { PrismaService } from "@/services/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateEventInput } from "../domain/event.entity";
import { PaginatedQueryParams } from "@/common/types";

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}
  async createEvent(data: CreateEventInput): Promise<{ id: number }> {
    const event = await this.prisma.event.create({
      data,
      select: {
        id: true
      }
    });

    return event;
  }

  async findAll(filters?: PaginatedQueryParams): Promise<any> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.event.findMany({ skip, take: limit, orderBy: { id: "desc" } }),
      this.prisma.event.count()
    ]);

    return { items, total, page, limit };
  }
}
