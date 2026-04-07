import { PrismaService } from "@/services/prisma/prisma.service";

import { AuthRepositoryPort, SYSTEM_USER_ID } from "./auth-repository.port";
import { CreateAuthWithCreator, Gender } from "../../domain/auth.entity";

export class PrismaAuthRepository implements AuthRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAuthWithCreator): Promise<{ id: number }> {
    const person = await this.prisma.person.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        gender: data.gender as Gender,
        phoneNumber: data.phoneNumber,
        birthdate: data.birthdate ?? null,
        districtId: data.districtId,
        userId: data.userId,
        createdBy: data.createdBy ?? SYSTEM_USER_ID
      },
      select: {
        id: true
      }
    });

    return person;
  }
}
