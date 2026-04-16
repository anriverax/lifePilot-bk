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

    try {
      await auth.api.signUpEmail({
        body: {
          name: `${rest.firstName} ${rest.lastName}`.trim(),
          email,
          password: passwd
        }
      });

      const isExistUser = await this.userRepository.findByIdOrEmail(undefined, email);

      if (!isExistUser) {
        throw new InternalServerErrorException("No se encontró el usuario creado por Better Auth");
      }

      const result = await this.authRepository.create({
        ...rest,
        userId: isExistUser.id,
        createdBy: SYSTEM_USER_ID
      });

      return result ? true : false;
    } catch (error: unknown) {
      const msg = String((error as any)?.message ?? "").toLowerCase();
      // Mapeo común para email duplicado
      if (
        msg.includes("already exists") ||
        msg.includes("already in use") ||
        msg.includes("duplicate") ||
        msg.includes("unique")
      ) {
        throw new ConflictException("El correo ya está registrado");
      }

      // Si ya es una excepción HTTP de Nest, relanzar
      if ((error as any)?.status && (error as any)?.response) throw error;

      throw new InternalServerErrorException("No se pudo crear la cuenta");
    }
  }
}
