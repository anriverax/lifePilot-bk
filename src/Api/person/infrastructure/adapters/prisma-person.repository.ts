import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/services/prisma/prisma.service";
import { PersonEntity } from "../../domain/entities/person.entity";
import {
  CreatePersonData,
  PersonRepositoryPort,
  SYSTEM_USER_ID
} from "../../domain/ports/person-repository.port";
import { PersonAggregate } from "../../domain/aggregates/person.aggregate";
import { TypeGender } from "@prisma/client";

@Injectable()
export class PrismaPersonRepository implements PersonRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Save a Person aggregate to persistence
   * Takes the domain aggregate and persists it to the database
   */
  async save(aggregate: PersonAggregate): Promise<number> {
    const person = await this.prisma.person.create({
      data: {
        firstName: aggregate.getFirstName(),
        lastName: aggregate.getLastName(),
        address: aggregate.getAddress(),
        gender: aggregate.getGender().getValue() as TypeGender,
        phoneNumber: aggregate.getPhoneNumber(),
        birthdate: aggregate.getBirthdate(),
        districtId: aggregate.getDistrictId(),
        createdBy: aggregate.getCreatedBy()
      }
    });

    return person.id;
  }

  /**
   * Find a Person aggregate by ID
   * Reconstructs the aggregate from persistence
   */
  async findAggregateById(id: number): Promise<PersonAggregate | null> {
    const person = await this.prisma.person.findUnique({
      where: { id }
    });

    if (!person) {
      return null;
    }

    return PersonAggregate.restore(
      person.id,
      person.firstName,
      person.lastName,
      person.address,
      person.gender,
      person.phoneNumber,
      person.birthdate,
      person.districtId,
      person.createdAt,
      person.updatedAt,
      person.deletedAt,
      person.createdBy,
      person.updatedBy,
      person.deletedBy
    );
  }

  /**
   * Find a Person entity (read model) by ID
   * Returns plain entity for read operations
   */
  async findById(id: number): Promise<PersonEntity | null> {
    const person = await this.prisma.person.findUnique({
      where: { id }
    });

    return person as unknown as PersonEntity | null;
  }

  /**
   * Create a new person (legacy - for backward compatibility)
   * Maps CreatePersonData to entity
   */
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
        createdBy: data.createdBy ?? SYSTEM_USER_ID
      }
    });

    return person as unknown as PersonEntity;
  }

  /**
   * List all persons (read model)
   */
  async listAll(): Promise<PersonEntity[]> {
    const persons = await this.prisma.person.findMany({
      where: {
        deletedAt: null // Exclude soft-deleted
      }
    });

    return persons as unknown as PersonEntity[];
  }
}
