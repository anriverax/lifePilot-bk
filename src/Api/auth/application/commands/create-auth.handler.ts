import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateAuthCommand } from "./create-auth.command";
import { ConflictException, Inject, InternalServerErrorException } from "@nestjs/common";
import {
  AUTH_REPOSITORY,
  AuthRepositoryPort,
  SYSTEM_USER_ID
} from "../repositories/auth-repository.port";
import { AuthService } from "../../domain/services/auth.service";
import {
  USER_REPOSITORY,
  UserRepositoryPort
} from "@/api/user/application/repositories/user-repository.port";
import { auth } from "@/lib/auth";

@CommandHandler(CreateAuthCommand)
export class CreateAuthHandler implements ICommandHandler<CreateAuthCommand> {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryPort,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly authService: AuthService
  ) {}
  async execute(command: CreateAuthCommand): Promise<{ id: number }> {
    const { data } = command;
    const { email, passwd, ...rest } = data;

    const hashedPassword = await this.authService.hashPassword(passwd);

    try {
      await auth.api.signUpEmail({
        body: {
          name: `${rest.firstName} ${rest.lastName}`.trim(),
          email,
          password: hashedPassword
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

      return result;
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
