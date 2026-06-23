import { auth } from "@/lib/auth";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { fromNodeHeaders } from "better-auth/node";
import { LogoutCommand } from "./logout.command";
import { ErrorHandlingService } from "@/services/errorHandling/error-handling.service";

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(private readonly errorHandlingService: ErrorHandlingService) {}
  async execute(command: LogoutCommand): Promise<boolean> {
    try {
      const response = await auth.api.signOut({
        headers: fromNodeHeaders(command.headers)
      });

      this.errorHandlingService.requireTrue(Boolean(response), "No se pudo cerrar la sesión");

      return true;
    } catch (error: unknown) {
      this.errorHandlingService.handleBetterAuthError("LogoutHandler.execute", error);
    }
  }
}
