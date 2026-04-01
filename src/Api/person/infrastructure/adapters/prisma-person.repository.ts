import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/services/prisma/prisma.service";
import { PersonEntity } from "../../domain/entities/person.entity";
import {
  CreatePersonData,
  PersonRepositoryPort,
  SYSTEM_USER_ID,
} from "../../domain/ports/person-repository.port";
import { TypeGender } from "@prisma/client";

@Injectable()
export class PrismaPersonRepository implements PersonRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePersonData): Promise<PersonEntity> {
    const person = await this.prisma.person.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        gender: data.gender as TypeGender,
        phoneNumber: data.phoneNumber,
        birthdate: data.birthdate ?? null,
        districtId: data.districtId,
        createdBy: data.createdBy ?? SYSTEM_USER_ID,
      },
    });

    return person as unknown as PersonEntity;
  }

  async findById(id: number): Promise<PersonEntity | null> {
    const person = await this.prisma.person.findUnique({
      where: { id },
    });

    return person as unknown as PersonEntity | null;
  }
}
