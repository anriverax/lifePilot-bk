import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateAuthCommand } from "./create-auth.command";
import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { auth } from "@/lib/auth";
import { hashPassword } from "@/lib/argon";
import { AuthRepository, SYSTEM_USER_ID } from "../../repositories/auth.repository";
import { UserRepository } from "../../repositories/user.repository";

@CommandHandler(CreateAuthCommand)
export class CreateAuthHandler implements ICommandHandler<CreateAuthCommand> {
  constructor(
    private readonly authRepository: AuthRepository,

    private readonly userRepository: UserRepository
  ) {}
  async execute(command: CreateAuthCommand): Promise<{ id: number }> {
    const { data } = command;
    const { email, passwd, ...rest } = data;

    const hashedPassword = await hashPassword(passwd);
    console.log(data);
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
      console.log("Error en CreateAuthHandler:", msg, error);
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
