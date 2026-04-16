import { AuthPayload } from "@/api/auth/domain/auth.entity";
import { Command } from "@nestjs/cqrs";

export class AuthCommand extends Command<{ token: string; user: unknown }> {
  constructor(public readonly data: AuthPayload) {
    super();
  }
}
