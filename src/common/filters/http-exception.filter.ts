import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type */
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse() as string | { message?: string | string[] };

    /** eslint-disable */

    const errors =
      typeof exceptionResponse === "string"
        ? [exceptionResponse]
        : Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message
          : [exceptionResponse.message || "Error inesperado"];

    const message = errors[0] || "Error inesperado";

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
      data: null,
      errors
    });
  }
}
