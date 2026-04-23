import { ChangePasswordInput } from "@/api/auth/domain/auth.entity";
import { Command } from "@nestjs/cqrs";
import { IncomingHttpHeaders } from "node:http";

export class ChangePasswordCommand extends Command<boolean> {
  constructor(
    public readonly data: ChangePasswordInput,
    public readonly headers: IncomingHttpHeaders
  ) {
    super();
  }
}
