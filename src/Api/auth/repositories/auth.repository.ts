import { PrismaService } from "@/services/prisma/prisma.service";

import { CreateAuthWithCreator, Gender } from "../domain/auth.entity";
import { Injectable } from "@nestjs/common";

export const SYSTEM_USER_ID = 0;

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAuthWithCreator): Promise<{ id: number }> {
    const person = await this.prisma.person.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        gender: data.gender as Gender,
        phoneNumber: data.phoneNumber,
        birthdate: data.birthdate,
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
