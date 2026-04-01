import { Module } from "@nestjs/common";
import { PersonController } from "./infrastructure/controllers/person.controller";
import { CreatePersonUseCase } from "./application/use-cases/create-person.use-case";
import { PrismaPersonRepository } from "./infrastructure/adapters/prisma-person.repository";
import { PERSON_REPOSITORY } from "./domain/ports/person-repository.port";

@Module({
  controllers: [PersonController],
  providers: [
    CreatePersonUseCase,
    {
      provide: PERSON_REPOSITORY,
      useClass: PrismaPersonRepository,
    },
  ],
  exports: [PERSON_REPOSITORY],
})
export class PersonModule {}
