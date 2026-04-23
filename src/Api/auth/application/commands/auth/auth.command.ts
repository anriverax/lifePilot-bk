import { AuthInput, AuthResponse } from "@/api/auth/domain/auth.entity";
import { Command } from "@nestjs/cqrs";

export class AuthCommand extends Command<AuthResponse> {
  constructor(public readonly data: AuthInput) {
    super();
  }
}
