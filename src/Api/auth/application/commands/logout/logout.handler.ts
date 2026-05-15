import { auth } from "@/lib/auth";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { fromNodeHeaders } from "better-auth/node";
import { LogoutCommand } from "./logout.command";

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  async execute(command: LogoutCommand): Promise<boolean> {
    try {
      const response = await auth.api.signOut({
        headers: fromNodeHeaders(command.headers)
      });

      return Boolean(response);
    } catch (error: unknown) {
      const msg = String((error as any)?.message ?? "").toLowerCase();

      if (msg.includes("unauthorized") || msg.includes("not authenticated")) {
        throw new BadRequestException("No hay una sesión válida para cerrar");
      }

      if ((error as any)?.status && (error as any)?.response) throw error;

      throw new InternalServerErrorException("No se pudo cerrar la sesión");
    }
  }
}
