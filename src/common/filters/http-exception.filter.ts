import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { ErrorHandlingService } from "../../services/errorHandling/error-handling.service";

interface ErrorResponsePayload {
  statusCode: number;
  timestamp: string;
  message: string;
  data: null;
  errors: string[];
}

type NestExceptionResponse = string | { message?: string | string[]; error?: string };

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  constructor(private readonly errorHandlingService: ErrorHandlingService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const httpException = this.errorHandlingService.toHttpException(
      `${request.method} ${request.url}`,
      exception
    );

    const payload = this.buildErrorResponse(httpException);

    this.logException(httpException, request);

    response.status(httpException.getStatus()).json(payload);
  }

  private buildErrorResponse(exception: {
    getStatus(): number;
    getResponse(): string | { message?: string | string[] };
  }): ErrorResponsePayload {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errors = this.extractErrors(exceptionResponse);

    return {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: "No se pudo procesar la solicitud",
      data: null,
      errors
    };
  }

  private extractErrors(exceptionResponse: NestExceptionResponse): string[] {
    if (typeof exceptionResponse === "string") {
      return [exceptionResponse];
    }

    if (Array.isArray(exceptionResponse.message)) {
      return exceptionResponse.message;
    }

    return [exceptionResponse.message ?? "Error inesperado"];
  }

  private logException(exception: HttpException, request: Request): void {
    const status = exception.getStatus();
    const context = `${request.method} ${request.url}`;

    // ✅ 5xx → error real (requiere atención); 4xx → warning (cliente, no urgente)
    if (status >= 500) {
      this.logger.error(`[${status}] ${context}`, exception.stack);
    } else {
      this.logger.warn(`[${status}] ${context} — ${exception.message}`);
    }
  }
}
