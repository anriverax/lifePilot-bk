/**
 * Get Person By ID Query Handler
 * Handles read operations for retrieving a single person by ID
 */

import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject, Injectable } from "@nestjs/common";
import { GetPersonByIdQuery } from "../queries/get-person-by-id.query";
import { PERSON_REPOSITORY, PersonRepositoryPort } from "../../domain/ports/person-repository.port";
import { PersonEntity } from "../../domain/entities/person.entity";

@Injectable()
@QueryHandler(GetPersonByIdQuery)
export class GetPersonByIdHandler implements IQueryHandler<GetPersonByIdQuery> {
  constructor(
    @Inject(PERSON_REPOSITORY)
    private readonly personRepository: PersonRepositoryPort
  ) {}

  async execute(query: GetPersonByIdQuery): Promise<PersonEntity | null> {
    return this.personRepository.findById(query.id);
  }
}
