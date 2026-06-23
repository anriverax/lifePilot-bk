import { AuthResponse } from "@/api/auth/domain/auth.entity";
import { auth } from "@/lib/auth";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LoginWithOtpCommand } from "./login-with-otp.command";
import { AuthorizationService } from "@/api/auth/services/authorization.service";
import { ErrorHandlingService } from "@/services/errorHandling/error-handling.service";

@CommandHandler(LoginWithOtpCommand)
export class LoginWithOtpHandler implements ICommandHandler<LoginWithOtpCommand> {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly errorHandlingService: ErrorHandlingService
  ) {}

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

      await this.authorizationService.primeAuthorizationCache(id);

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
    } catch (error: unknown) {
      this.errorHandlingService.handleBetterAuthError("LoginWithOtpHandler.execute", error);
    }
  }
}
