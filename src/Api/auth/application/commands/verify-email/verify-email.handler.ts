import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { VerifyEmailCommand } from "./verify-email.command";
import { auth } from "@/lib/auth";
import { ErrorHandlingService } from "@/services/errorHandling/error-handling.service";

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
  constructor(private readonly errorHandlingService: ErrorHandlingService) {}
  async execute(command: VerifyEmailCommand): Promise<boolean> {
    const { data } = command;
    const { email, otp } = data;

    try {
      const res = await auth.api.verifyEmailOTP({
        body: {
          email,
          otp: otp.toString()
        }
      });

      this.errorHandlingService.requireTrue(res.status, "No se pudo verificar el correo");

      return true;
    } catch (error: unknown) {
      this.errorHandlingService.handleBetterAuthError("VerifyEmailHandler.execute", error);
    }
  }
}
