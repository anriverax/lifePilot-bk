import { ArgumentsHost, Catch, ExceptionFilter, Injectable } from "@nestjs/common";
import { Request, Response } from "express";
import { ErrorHandlingService } from "../../services/errorHandling/error-handling.service";

type ErrorResponsePayload = {
  statusCode: number;
  timestamp: string;
  message: string;
  data: null;
  errors: string[];
};

@Catch()
@Injectable()
/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type */
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorHandlingService: ErrorHandlingService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const httpException = this.errorHandlingService.toHttpException(
      `${request.method} ${request.url}`,
      exception
    );

    response.status(httpException.getStatus()).json(this.buildErrorResponse(httpException));
  }

  private buildErrorResponse(exception: {
    getStatus(): number;
    getResponse(): string | { message?: string | string[] };
  }): ErrorResponsePayload {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errors =
      typeof exceptionResponse === "string"
        ? [exceptionResponse]
        : Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message
          : [exceptionResponse.message ?? "Error inesperado"];

    return {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: errors[0] ?? "Error inesperado",
      data: null,
      errors
    };
  }
}
