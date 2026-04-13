import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common";

type PrismaLikeError = {
  code?: string;
  message?: string;
  meta?: {
    target?: string[];
    field_name?: string;
  };
};

type ValidationLikeError = {
  name?: string;
  message?: string;
};

type HttpExceptionContext =
  | {
      kind?: "default" | "prisma" | "business";
    }
  | {
      kind: "external";
      service: string;
    };

@Injectable()
export class ErrorHandlingService {
  private readonly logger = new Logger(ErrorHandlingService.name);

  handlePrismaError(context: string, error: unknown): never {
    throw this.toHttpException(context, error, { kind: "prisma" });
  }

  handleBusinessLogicError(context: string, error: unknown): never {
    throw this.toHttpException(context, error, { kind: "business" });
  }

  handleExternalServiceError(context: string, service: string, error: unknown): never {
    throw this.toHttpException(context, error, { kind: "external", service });
  }

  toHttpException(
    context: string,
    error: unknown,
    exceptionContext: HttpExceptionContext = { kind: "default" }
  ): HttpException {
    if (exceptionContext.kind === "external") {
      this.logger.error(
        `[${context}] External Service Error (${exceptionContext.service})`,
        this.getLogMessage(error)
      );

      return new InternalServerErrorException(
        `Error comunicándose con ${exceptionContext.service}. Por favor intente más tarde.`
      );
    }

    if (error instanceof HttpException) {
      return error;
    }

    if (this.isPrismaError(error)) {
      this.logPrismaError(context, error);
      return this.mapPrismaError(error);
    }

    if (this.isValidationError(error)) {
      const validationScope =
        exceptionContext.kind === "business" ? "Business Logic Error" : "Validation Error";
      this.logger.error(`[${context}] ${validationScope}`, this.getLogMessage(error));
      return new BadRequestException(error.message ?? "Error de validación");
    }

    if (exceptionContext.kind === "business") {
      this.logger.error(`[${context}] Business Logic Error`, this.getLogMessage(error));
      return new InternalServerErrorException(
        this.getErrorMessage(error, "Error procesando la solicitud")
      );
    }

    this.logger.error(`[${context}] Unexpected Error`, this.getLogMessage(error));
    return new InternalServerErrorException(this.getErrorMessage(error, "Error interno del servidor"));
  }

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

  private mapPrismaError(error: unknown): HttpException {
    const prismaError = this.isPrismaError(error) ? error : undefined;

    if (prismaError?.code === "P2002") {
      const field = prismaError.meta?.target?.[0] ?? "field";
      return new ConflictException(`Ya existe un registro con este ${field}`);
    }

    if (prismaError?.code === "P2025") {
      return new NotFoundException("El registro solicitado no fue encontrado");
    }

    if (prismaError?.code === "P2003") {
      const relation = prismaError.meta?.field_name ?? "relation";
      return new BadRequestException(`Referencia inválida: ${relation}`);
    }

    if (prismaError?.code === "P2014") {
      return new BadRequestException(
        "No se puede eliminar este registro porque está siendo referenciado"
      );
    }

    return new InternalServerErrorException("Error en la base de datos. Por favor intente más tarde.");
  }

  private isPrismaError(error: unknown): error is PrismaLikeError {
    return typeof error === "object" && error !== null && "code" in error;
  }

  private isValidationError(error: unknown): error is ValidationLikeError {
    return (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as ValidationLikeError).name === "ValidationError"
    );
  }

  private logPrismaError(context: string, error: unknown): void {
    if (this.isPrismaError(error)) {
      this.logger.error(`[${context}] Prisma Error`, {
        code: error.code,
        message: error.message,
        meta: error.meta
      });
      return;
    }

    this.logger.error(`[${context}] Prisma Error`, this.getLogMessage(error));
  }

  private getLogMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.stack ?? error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "No fue posible serializar el error";
    }
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as ValidationLikeError).message === "string"
    ) {
      return (error as ValidationLikeError).message ?? fallback;
    }

    return fallback;
  }
}
