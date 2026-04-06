import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateAuthCommand } from "./create-auth.command";
import { ConflictException, Inject } from "@nestjs/common";
import { AUTH_REPOSITORY, AuthRepositoryPort } from "../repositories/auth-repository.port";
import { USER_REPOSITORY, UserRepositoryPort } from "@/api/user/repositories/user-repository.port";
import { AuthService } from "../../domain/auth.service";

@CommandHandler(CreateAuthCommand)
export class CreateAuthHandler implements ICommandHandler<CreateAuthCommand> {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryPort,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly authService: AuthService
  ) {}
  async execute(command: CreateAuthCommand): Promise<void> {
    const { data } = command;

    const isExistUser = await this.userRepository.findByIdOrEmail(undefined, data.email);

    if (isExistUser?.email === data.email) {
      throw new ConflictException("Este usuario ya se encuentra registrado en el sistema.");
    }

    const hashedPassword = await this.authService.hashPassword(data.passwd);

    await this.authRepository.create({ ...data, passwd: hashedPassword });
  }
}
