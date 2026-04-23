import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { ChangePasswordCommand } from "./change-password.command";

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  async execute(command: ChangePasswordCommand): Promise<boolean> {
    const { data, headers } = command;
    const { currentPassword, newPassword } = data;

    try {
      const res = await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
          revokeOtherSessions: true
        },
        headers: fromNodeHeaders(headers)
      });

      if (res) {
        return true;
      }

      return false;
    } catch (error) {
      const msg = String((error as any)?.message ?? "").toLowerCase();

      if (
        msg.includes("invalid password") ||
        msg.includes("incorrect password") ||
        msg.includes("wrong password")
      ) {
        throw new BadRequestException("La contraseña actual es incorrecta");
      }

      if (msg.includes("same password") || msg.includes("password is the same")) {
        throw new BadRequestException("La nueva contraseña debe ser diferente a la actual");
      }

      if (msg.includes("unauthorized") || msg.includes("not authenticated")) {
        throw new BadRequestException("No autorizado para realizar esta acción");
      }

      if ((error as any)?.status && (error as any)?.response) throw error;

      throw new InternalServerErrorException("No se pudo cambiar la contraseña");
    }
  }
}
