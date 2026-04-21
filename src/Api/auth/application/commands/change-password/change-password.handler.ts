import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { auth } from "@/lib/auth";
import { ChangePasswordCommand } from "./change-password.command";

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  async execute(command: ChangePasswordCommand): Promise<boolean> {
    const { data } = command;
    const { email, otp } = data;

    try {
      const res = await auth.api.verifyEmailOTP({
        body: {
          email,
          otp: otp.toString()
        }
      });

      console.log("Email verification response:", res);

      if (res.status) {
        return true;
      }

      return false;
    } catch (error) {
      const msg = String((error as any)?.message ?? "").toLowerCase();

      if (msg.includes("invalid otp") || msg.includes("invalid code")) {
        throw new BadRequestException("El código OTP es inválido");
      }

      if (msg.includes("expired")) {
        throw new BadRequestException("El código OTP ha expirado");
      }

      // Si ya es una excepción HTTP de Nest, relanzar
      if ((error as any)?.status && (error as any)?.response) throw error;

      throw new InternalServerErrorException("No se pudo verificar el correo");
    }
  }
}
