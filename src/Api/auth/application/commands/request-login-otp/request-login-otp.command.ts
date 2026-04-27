import { RequestLoginOtpInput } from "@/api/auth/domain/auth.entity";
import { Command } from "@nestjs/cqrs";

export class RequestLoginOtpCommand extends Command<boolean> {
  constructor(public readonly data: RequestLoginOtpInput) {
    super();
  }
}
