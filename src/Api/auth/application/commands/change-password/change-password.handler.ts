import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { ChangePasswordCommand } from "./change-password.command";
import { ErrorHandlingService } from "@/services/errorHandling/error-handling.service";

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  constructor(private readonly errorHandlingService: ErrorHandlingService) {}

  async execute(command: ChangePasswordCommand): Promise<boolean> {
    const { data, headers } = command;
    const { currentPassword, newPassword } = data;

    try {
      const res = await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
          revokeOtherSessions: true
        },
        headers: fromNodeHeaders(headers)
      });

      this.errorHandlingService.requireTrue(Boolean(res), "No se pudo cambiar la contraseña");

      return true;
    } catch (error: unknown) {
      this.errorHandlingService.handleBetterAuthError("ChangePasswordHandler.execute", error);
    }
  }
}
