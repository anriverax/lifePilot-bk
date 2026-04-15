import { VerifyEmailOtp } from "@/api/auth/domain/auth.entity";
import { Command } from "@nestjs/cqrs";

export class VerifyEmailCommand extends Command<boolean> {
  constructor(public readonly data: VerifyEmailOtp) {
    super();
  }
}
