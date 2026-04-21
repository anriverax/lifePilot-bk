import { ChangePasswordInput } from "@/api/auth/domain/auth.entity";
import { Command } from "@nestjs/cqrs";

export class ChangePasswordCommand extends Command<boolean> {
  constructor(public readonly data: ChangePasswordInput) {
    super();
  }
}
