import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AuthCommand } from "./auth.command";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { auth } from "@/lib/auth";
import { AuthResponse } from "@/api/auth/domain/auth.entity";

@CommandHandler(AuthCommand)
export class AuthHandler implements ICommandHandler<AuthCommand> {
  async execute(command: AuthCommand): Promise<AuthResponse> {
    const { data } = command;

    try {
      const res = await auth.api.signInEmail({
        body: {
          email: data.email,
          password: data.passwd
        }
      });

      const { user, ...others } = res;
      const { name, email, image, roleId, id } = user;

      return {
        ...others,
        user: {
          name,
          email,
          image,
          roleId,
          id
        }
      };
    } catch (error) {
      const msg = String((error as any)?.message ?? "").toLowerCase();

      if (
        msg.includes("invalid email or password") ||
        msg.includes("invalid credentials") ||
        msg.includes("user not found")
      ) {
        throw new BadRequestException("Correo o contraseña incorrectos");
      }

      if (msg.includes("email not verified")) {
        throw new BadRequestException("El correo electrónico no ha sido verificado");
      }

      if (msg.includes("banned") || msg.includes("disabled") || msg.includes("blocked")) {
        throw new BadRequestException("La cuenta está deshabilitada");
      }

      // Si ya es una excepción HTTP de Nest, relanzar
      if ((error as any)?.status && (error as any)?.response) throw error;

      throw new InternalServerErrorException("No se pudo iniciar sesión");
    }
  }
}
