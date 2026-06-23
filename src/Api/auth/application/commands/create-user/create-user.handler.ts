import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { auth } from "@/lib/auth";
import { AuthRepository, SYSTEM_USER_ID } from "../../../repositories/auth.repository";
import { UserRepository } from "../../../repositories/user.repository";
import { CreateUserCommand } from "./create-user.command";

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly authRepository: AuthRepository,

    private readonly userRepository: UserRepository
  ) {}
  async execute(command: CreateUserCommand): Promise<boolean> {
    const { data } = command;
    const { email, passwd, ...rest } = data;

    const existing = await this.userRepository.findByIdOrEmail(undefined, email);
    if (existing) {
      throw new ConflictException("El correo ya está registrado");
    }

    await auth.api.signUpEmail({
      body: {
        name: `${rest.firstName} ${rest.lastName}`.trim(),
        email,
        password: passwd
      }
    });

    const createdUser = await this.resolveCreatedUser(email);

    const result = await this.authRepository.create({
      ...rest,
      userId: createdUser.id,
      createdBy: SYSTEM_USER_ID
    });

    if (!result) {
      // Aquí sí deberías compensar: eliminar el usuario de Better Auth
      // await this.rollbackBetterAuthUser(email);
      throw new InternalServerErrorException("No se pudo persistir la cuenta creada");
    }

    return true;
  }

  private async resolveCreatedUser(email: string, attempts = 3, delayMs = 150) {
    for (let i = 0; i < attempts; i++) {
      const user = await this.userRepository.findByIdOrEmail(undefined, email);
      if (user) return user;
      if (i < attempts - 1) await this.delay(delayMs);
    }

    throw new InternalServerErrorException(
      "No se encontró el usuario tras el registro en el proveedor de autenticación"
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
