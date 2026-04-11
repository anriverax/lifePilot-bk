import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common";

@Injectable()
export class ErrorHandlingService {
  private readonly logger = new Logger(ErrorHandlingService.name);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  handlePrismaError(context: string, error: any): never {
    this.logger.error(`[${context}] Prisma Error:`, {
      code: error.code,
      message: error.message,
      meta: error.meta
    });

    if (error.code === "P2002") {
      const field = error.meta?.target?.[0] || "field";
      throw new ConflictException(`Ya existe un registro con este ${field}`);
    }

    if (error.code === "P2025") {
      throw new NotFoundException("El registro solicitado no fue encontrado");
    }

    if (error.code === "P2003") {
      const relation = error.meta?.field_name || "relation";
      throw new BadRequestException(`Referencia inválida: ${relation}`);
    }

    if (error.code === "P2014") {
      throw new BadRequestException(
        "No se puede eliminar este registro porque está siendo referenciado"
      );
    }

    throw new InternalServerErrorException("Error en la base de datos. Por favor intente más tarde.");
  }

  handleBusinessLogicError(context: string, error: any): never {
    this.logger.error(`[${context}] Business Logic Error:`, error);

    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException ||
      error instanceof ConflictException
    ) {
      throw error;
    }

    // Si es error de validación personalizado
    if (error.name === "ValidationError") {
      throw new BadRequestException(error.message);
    }

    throw new InternalServerErrorException(error.message || "Error procesando la solicitud");
  }

  handleExternalServiceError(context: string, service: string, error: any): never {
    this.logger.error(`[${context}] External Service Error (${service}):`, error);

    throw new InternalServerErrorException(
      `Error comunicándose con ${service}. Por favor intente más tarde.`
    );
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  requireNotNull<T>(value: T | null | undefined, message: string): T {
    if (value == null) {
      throw new NotFoundException(message);
    }
    return value;
  }

  requireTrue(condition: boolean, message: string): void {
    if (!condition) {
      throw new BadRequestException(message);
    }
  }
}
