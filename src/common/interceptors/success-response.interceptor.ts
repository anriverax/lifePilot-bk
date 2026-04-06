import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const response = http.getResponse<{ statusCode: number }>();
    const request = http.getRequest<{ method?: string }>();

    return next.handle().pipe(
      map((data: unknown) => {
        if (this.isAlreadyWrapped(data)) {
          const wrappedData = data as {
            statusCode: number;
            message: string | string[];
            data?: unknown;
            errors?: string[];
          };

          return {
            ...wrappedData,
            errors: wrappedData.errors ?? []
          };
        }

        return {
          statusCode: response.statusCode,
          message: this.getSuccessMessageByMethod(request.method),
          data,
          errors: []
        };
      })
    );
  }

  private getSuccessMessageByMethod(method?: string): string {
    if (method === "GET") {
      return "Consulta realizada con éxito.";
    }

    if (method === "POST") {
      return "Registro creado con éxito.";
    }

    if (method === "PUT" || method === "PATCH") {
      return "Registro actualizado con éxito.";
    }

    if (method === "DELETE") {
      return "Registro eliminado con éxito.";
    }

    return "Operación realizada con éxito.";
  }

  private isAlreadyWrapped(data: unknown): boolean {
    if (!data || typeof data !== "object") {
      return false;
    }

    const candidate = data as Record<string, unknown>;
    return "statusCode" in candidate && "message" in candidate;
  }
}
