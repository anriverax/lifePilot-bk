import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { PersonController } from "./infrastructure/controllers/person.controller";
import { PrismaPersonRepository } from "./infrastructure/adapters/prisma-person.repository";
import { PERSON_REPOSITORY } from "./domain/ports/person-repository.port";

// Command Handlers
import { CreatePersonHandler } from "./application/command-handlers/create-person.handler";

// Query Handlers
import { GetPersonByIdHandler } from "./application/query-handlers/get-person-by-id.handler";
import { ListPersonsHandler } from "./application/query-handlers/list-persons.handler";

// Event Handlers
import { PersonCreatedHandler } from "./application/event-handlers/person-created.handler";

// Domain Services
import { PersonFactoryService } from "./domain/domain-services/person-factory.service";

const commandHandlers = [CreatePersonHandler];
const queryHandlers = [GetPersonByIdHandler, ListPersonsHandler];
const eventHandlers = [PersonCreatedHandler];
const domainServices = [PersonFactoryService];

@Module({
  imports: [CqrsModule],
  controllers: [PersonController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
    ...domainServices,
    {
      provide: PERSON_REPOSITORY,
      useClass: PrismaPersonRepository
    }
  ],
  exports: [PERSON_REPOSITORY]
})
export class PersonModule {}
