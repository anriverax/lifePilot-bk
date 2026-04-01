import { Inject, Injectable } from "@nestjs/common";
import { PersonEntity } from "../../domain/entities/person.entity";
import {
  PERSON_REPOSITORY,
  PersonRepositoryPort,
  CreatePersonData,
} from "../../domain/ports/person-repository.port";
import { CreatePersonDto } from "../dtos/create-person.dto";

@Injectable()
export class CreatePersonUseCase {
  constructor(
    @Inject(PERSON_REPOSITORY)
    private readonly personRepository: PersonRepositoryPort,
  ) {}

  async execute(dto: CreatePersonDto): Promise<PersonEntity> {
    const data: CreatePersonData = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      address: dto.address,
      gender: dto.gender,
      phoneNumber: dto.phoneNumber,
      birthdate: dto.birthdate ? new Date(dto.birthdate) : null,
      districtId: dto.districtId,
    };

    return this.personRepository.create(data);
  }
}
