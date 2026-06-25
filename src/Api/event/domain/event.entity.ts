import { Event } from "@/prisma/generated/client";
export type CreateEventInput = Omit<
  Event,
  "id" | "createdAt" | "updatedAt" | "deletedAt" | "updatedBy" | "deletedBy"
>;

export interface EventEntity extends Omit<CreateEventInput, "createdBy"> {
  id: number;
}
