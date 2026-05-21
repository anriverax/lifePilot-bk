import { Command } from "@nestjs/cqrs";
import { ResendCodeDto } from "../../resend-code.dto";

export class ResendCodeCommand extends Command<boolean> {
  constructor(public readonly data: ResendCodeDto) {
    super();
  }
}
