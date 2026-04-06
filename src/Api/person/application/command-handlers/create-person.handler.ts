/**
 * Create Person Command Handler
 * Orchestrates command execution using domain logic
 * Pure command handling - uses aggregate and repository
 */

import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { Inject, Injectable } from "@nestjs/common";
import { CreatePersonCommand } from "../commands/create-person.command";
import { PersonFactoryService } from "../../domain/domain-services/person-factory.service";
import { PERSON_REPOSITORY, PersonRepositoryPort } from "../../domain/ports/person-repository.port";

@Injectable()
@CommandHandler(CreatePersonCommand)
export class CreatePersonHandler implements ICommandHandler<CreatePersonCommand> {
  constructor(
    @Inject(PERSON_REPOSITORY)
    private readonly personRepository: PersonRepositoryPort,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreatePersonCommand): Promise<number> {
    // 1. Use domain factory to create aggregate (pure logic)
    const personAggregate = PersonFactoryService.create({
      firstName: command.firstName,
      lastName: command.lastName,
      address: command.address,
      gender: command.gender,
      phoneNumber: command.phoneNumber,
      birthdate: command.birthdate,
      districtId: command.districtId,
      createdBy: command.createdBy
    });

    // 2. Save aggregate to persistence
    const personId = await this.personRepository.save(personAggregate);

    // 3. Publish domain events
    const events = personAggregate.getUncommittedEvents();
    events.forEach((event) => this.eventBus.publish(event));

    // 4. Clear events after publishing
    personAggregate.clearUncommittedEvents();

    return personId;
  }
}
