import { Command } from "@nestjs/cqrs";
import { IncomingHttpHeaders } from "node:http";

export class LogoutCommand extends Command<boolean> {
  constructor(public readonly headers: IncomingHttpHeaders) {
    super();
  }
}
