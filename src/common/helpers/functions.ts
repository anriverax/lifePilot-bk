import { BadRequestException, ForbiddenException, Logger } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

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
