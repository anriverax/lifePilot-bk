import { auth } from "@/lib/auth";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RequestLoginOtpCommand } from "./request-login-otp.command";
import { ErrorHandlingService } from "@/services/errorHandling/error-handling.service";

@CommandHandler(RequestLoginOtpCommand)
export class RequestLoginOtpHandler implements ICommandHandler<RequestLoginOtpCommand> {
  constructor(private readonly errorHandlingService: ErrorHandlingService) {}
  async execute(command: RequestLoginOtpCommand): Promise<boolean> {
    const { email } = command.data;

    try {
      const response = await auth.api.sendVerificationOTP({
        body: {
          email,
          type: "sign-in"
        }
      });

      this.errorHandlingService.requireTrue(
        response.success,
        "No se pudo generar el código de inicio de sesión"
      );

      return true;
    } catch (error) {
      this.errorHandlingService.handleBetterAuthError("RequestLoginOtpHandler.execute", error);
    }
  }
}
