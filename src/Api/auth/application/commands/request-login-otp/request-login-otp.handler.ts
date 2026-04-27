import { auth } from "@/lib/auth";
import { BadGatewayException, InternalServerErrorException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RequestLoginOtpCommand } from "./request-login-otp.command";

@CommandHandler(RequestLoginOtpCommand)
export class RequestLoginOtpHandler implements ICommandHandler<RequestLoginOtpCommand> {
  async execute(command: RequestLoginOtpCommand): Promise<boolean> {
    const { email } = command.data;

    try {
      const response = await auth.api.sendVerificationOTP({
        body: {
          email,
          type: "sign-in"
        }
      });

      return response.success;
    } catch (error) {
      const msg = String((error as any)?.message ?? "").toLowerCase();

      if (msg.includes("email") && msg.includes("send")) {
        throw new BadGatewayException("No se pudo enviar el código al correo");
      }

      if ((error as any)?.status && (error as any)?.response) throw error;

      throw new InternalServerErrorException("No se pudo generar el código de inicio de sesión");
    }
  }
}
