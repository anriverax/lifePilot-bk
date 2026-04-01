import { Module } from "@nestjs/common";
import { UserController } from "./infrastructure/controllers/user.controller";
import { CreateUserUseCase } from "./application/use-cases/create-user.use-case";
import { PrismaUserRepository } from "./infrastructure/adapters/prisma-user.repository";
import { USER_REPOSITORY } from "./domain/ports/user-repository.port";

@Module({
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
