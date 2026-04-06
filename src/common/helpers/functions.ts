import { BadRequestException, ForbiddenException, Logger } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { AES, enc } from "crypto-js";

export function handlePrismaError(module: string, error: any): never {
  const logger = new Logger(module);
  if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
    if ((error.meta?.target as any).find((field: string) => field === "dui"))
      throw new ForbiddenException("DUI ya está asociado a una cuenta.");
    else throw new ForbiddenException("Este correo electrónico ya está asociado a una cuenta.");
  }

  // Log or handle other Prisma errors appropriately
  logger.error(`❌ Error de prisma: `, error);
  throw new BadRequestException("Se ha producido un error al procesar su solicitud.");
}

export function firstCapitalLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function decryptTextTransformer(value: string): string {
  if (process.env.PLAIN_TEXT) {
    try {
      const result = AES.decrypt(value, process.env.PLAIN_TEXT);
      return result.toString(enc.Utf8);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error("Error de descifrado: " + error.message);
      }
      throw new Error("Error de descifrado desconocido.");
    }
  }

  throw new Error("El descifrado no está habilitado.");
}
