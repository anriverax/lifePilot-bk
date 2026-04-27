import { AuthResponse } from "@/api/auth/domain/auth.entity";
import { auth } from "@/lib/auth";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LoginWithOtpCommand } from "./login-with-otp.command";

@CommandHandler(LoginWithOtpCommand)
export class LoginWithOtpHandler implements ICommandHandler<LoginWithOtpCommand> {
  async execute(command: LoginWithOtpCommand): Promise<AuthResponse> {
    const { data } = command;

    try {
      const res = await auth.api.signInEmailOTP({
        body: {
          email: data.email,
          otp: data.otp.toString()
        }
      });

      const { user, ...others } = res;
      const typedUser = user as typeof user & { roleId: number };
      const { name, email, image, roleId, id } = typedUser;

      return {
        ...others,
        redirect: false,
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

      if (msg.includes("invalid otp") || msg.includes("invalid code")) {
        throw new BadRequestException("El código OTP es inválido");
      }

      if (msg.includes("expired")) {
        throw new BadRequestException("El código OTP ha expirado");
      }

      if (msg.includes("attempt") || msg.includes("too many")) {
        throw new BadRequestException("Se agotaron los intentos para validar el código");
      }

      if ((error as any)?.status && (error as any)?.response) throw error;

      throw new InternalServerErrorException("No se pudo iniciar sesión con el código");
    }
  }
}
