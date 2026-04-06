import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/services/prisma/prisma.service";

import { AuthRepositoryPort, SYSTEM_USER_ID } from "./auth-repository.port";
import { CreateAuthWithCreator, Gender } from "../../domain/auth.entity";

@Injectable()
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
        createdBy: data.createdBy ?? SYSTEM_USER_ID,
        User: {
          create: {
            email: data.email,
            passwd: data.passwd,
            roleId: data.roleId
          }
        }
      },
      select: {
        id: true
      }
    });

    return person;
  }
}
