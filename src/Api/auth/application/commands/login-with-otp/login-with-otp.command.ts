import { LoginWithOtpInput, AuthResponse } from "@/api/auth/domain/auth.entity";
import { Command } from "@nestjs/cqrs";

export class LoginWithOtpCommand extends Command<AuthResponse> {
  constructor(public readonly data: LoginWithOtpInput) {
    super();
  }
}
