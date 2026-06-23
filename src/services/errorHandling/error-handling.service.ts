import { Prisma } from "@/prisma/generated/client";
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common";

type ValidationLikeError = {
  name?: string;
  message?: string;
};

type HttpExceptionContext =
  | { kind: "default" }
  | { kind: "prisma" }
  | { kind: "business" }
  | { kind: "external"; service: string };

type BetterAuthErrorRule = {
  match: (message: string) => boolean;
  toException: (message: string) => HttpException;
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

  handleBetterAuthError(context: string, error: unknown): never {
    if (error instanceof HttpException) throw error;

    const message = this.getErrorMessage(error, "").toLowerCase();
    const rule = this.betterAuthRules.find((r) => r.match(message));

    if (rule) {
      const mapped = rule.toException(message);
      this.logger.warn(`[${context}] Better Auth Error`, this.getLogMessage(error));
      throw mapped;
    }

    this.logger.error(`[${context}] Unmapped Better Auth Error`, this.getLogMessage(error));
    throw new InternalServerErrorException("No se pudo procesar la solicitud de autenticación");
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
      return new BadRequestException((error as any).message ?? "Error de validación");
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

  private mapPrismaError(error: Prisma.PrismaClientKnownRequestError): HttpException {
    if (error.code === "P2002") {
      const target = error.meta?.target;
      const field = Array.isArray(target) ? target[0] : "field";
      return new ConflictException(`Ya existe un registro con este ${field}`);
    }

    if (error.code === "P2025") {
      return new NotFoundException("El registro solicitado no fue encontrado");
    }

    if (error.code === "P2003") {
      const relation = (error.meta?.field_name as string | undefined) ?? "relation";
      return new BadRequestException(`Referencia inválida: ${relation}`);
    }

    if (error.code === "P2014") {
      return new BadRequestException(
        "No se puede eliminar este registro porque está siendo referenciado"
      );
    }

    return new InternalServerErrorException("Error en la base de datos. Por favor intente más tarde.");
  }

  // ✅ Type guard real contra el error de Prisma, no estructural por "code" suelto
  private isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError;
  }

  private isValidationError(error: unknown): error is ValidationLikeError {
    return (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as ValidationLikeError).name === "ValidationError"
    );
  }

  private logPrismaError(context: string, error: Prisma.PrismaClientKnownRequestError): void {
    this.logger.error(`[${context}] Prisma Error`, {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
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

  private readonly betterAuthRules: BetterAuthErrorRule[] = [
    {
      match: (m) =>
        m.includes("invalid email or password") ||
        m.includes("invalid credentials") ||
        m.includes("user not found"),
      toException: () => new BadRequestException("Correo o contraseña incorrectos")
    },
    {
      match: (m) => m.includes("email not verified"),
      toException: () => new BadRequestException("El correo electrónico no ha sido verificado")
    },
    {
      match: (m) => m.includes("banned") || m.includes("disabled") || m.includes("blocked"),
      toException: () => new BadRequestException("La cuenta está deshabilitada")
    },
    {
      match: (m) => m.includes("invalid otp") || m.includes("invalid code"),
      toException: () => new BadRequestException("El código OTP es inválido")
    },
    {
      match: (m) => m.includes("expired"),
      toException: () => new BadRequestException("El código OTP ha expirado")
    },
    {
      match: (m) => m.includes("attempt") || m.includes("too many"),
      toException: () => new BadRequestException("Se agotaron los intentos para validar el código")
    },
    {
      match: (m) =>
        m.includes("invalid password") ||
        m.includes("incorrect password") ||
        m.includes("wrong password"),
      toException: () => new BadRequestException("La contraseña actual es incorrecta")
    },
    {
      match: (m) => m.includes("same password") || m.includes("password is the same"),
      toException: () => new BadRequestException("La nueva contraseña debe ser diferente a la actual")
    },
    {
      match: (m) => m.includes("unauthorized") || m.includes("not authenticated"),
      toException: () => new BadRequestException("No autorizado para realizar esta acción")
    },
    {
      match: (m) => m.includes("email") && m.includes("send"),
      toException: () => new BadGatewayException("No se pudo enviar el correo. Intente nuevamente")
    }
  ];
}
