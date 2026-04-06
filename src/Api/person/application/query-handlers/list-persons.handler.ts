/**
 * List Persons Query Handler
 * Handles read operations for retrieving all persons
 */

import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject, Injectable } from "@nestjs/common";
import { ListPersonsQuery } from "../queries/list-persons.query";
import { PERSON_REPOSITORY, PersonRepositoryPort } from "../../domain/ports/person-repository.port";
import { PersonEntity } from "../../domain/entities/person.entity";

@Injectable()
@QueryHandler(ListPersonsQuery)
export class ListPersonsHandler implements IQueryHandler<ListPersonsQuery> {
  constructor(
    @Inject(PERSON_REPOSITORY)
    private readonly personRepository: PersonRepositoryPort
  ) {}

  async execute(): Promise<PersonEntity[]> {
    return this.personRepository.listAll();
  }
}
