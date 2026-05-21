import { auth } from "@/lib/auth";
import { BadGatewayException, InternalServerErrorException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ResendCodeCommand } from "./resend-code.command";

@CommandHandler(ResendCodeCommand)
export class ResendCodeHandler implements ICommandHandler<ResendCodeCommand> {
  async execute(command: ResendCodeCommand): Promise<boolean> {
    const { email } = command.data;

    try {
      const response = await auth.api.sendVerificationOTP({
        body: { email, type: "email-verification" }
      });

      if (!response.success) {
        throw new InternalServerErrorException("No se pudo generar el código de verificación");
      }

      return true;
    } catch (error) {
      const msg = String((error as any)?.message ?? "").toLowerCase();

      if (msg.includes("email") && msg.includes("send")) {
        throw new BadGatewayException("No se pudo reenviar el código al correo");
      }

      if ((error as any)?.status && (error as any)?.response) throw error;

      throw new InternalServerErrorException("No se pudo generar el código de verificación");
    }
  }
}
