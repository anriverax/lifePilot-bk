import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AuthCommand } from "./auth.command";
import { auth } from "@/lib/auth";
import { AuthResponse } from "@/api/auth/domain/auth.entity";
import { AuthorizationService } from "@/api/auth/services/authorization.service";
import { ErrorHandlingService } from "@/services/errorHandling/error-handling.service";

@CommandHandler(AuthCommand)
export class AuthHandler implements ICommandHandler<AuthCommand> {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly errorHandlingService: ErrorHandlingService
  ) {}

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

      await this.authorizationService.primeAuthorizationCache(id);

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
    } catch (error: unknown) {
      this.errorHandlingService.handleBetterAuthError("AuthHandler.execute", error);
    }
  }
}
