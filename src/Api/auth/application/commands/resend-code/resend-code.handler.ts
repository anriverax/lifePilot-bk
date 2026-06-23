import { auth } from "@/lib/auth";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ResendCodeCommand } from "./resend-code.command";
import { ErrorHandlingService } from "@/services/errorHandling/error-handling.service";

@CommandHandler(ResendCodeCommand)
export class ResendCodeHandler implements ICommandHandler<ResendCodeCommand> {
  constructor(private readonly errorHandlingService: ErrorHandlingService) {}
  async execute(command: ResendCodeCommand): Promise<boolean> {
    const { email } = command.data;

    try {
      const response = await auth.api.sendVerificationOTP({
        body: { email, type: "email-verification" }
      });

      this.errorHandlingService.requireTrue(
        response.success,
        "No se pudo generar el código de verificación"
      );

      return true;
    } catch (error: unknown) {
      this.errorHandlingService.handleBetterAuthError("ResendCodeHandler.execute", error);
    }
  }
}
