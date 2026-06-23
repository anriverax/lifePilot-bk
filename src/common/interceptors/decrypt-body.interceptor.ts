import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor
} from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { decryptTextTransformer } from "../helpers/functions";

@Injectable()
export class DecryptBodyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DecryptBodyInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const body = request.body as Record<string, unknown> | undefined;

    if (body && typeof body === "object") {
      try {
        const decrypted: Record<string, unknown> = {};

        for (const key of Object.keys(body)) {
          const raw = body[key];
          const decryptedKey = decryptTextTransformer(key);
          decrypted[decryptedKey] = typeof raw === "string" ? decryptTextTransformer(raw) : raw;
        }

        request.body = decrypted;
      } catch (error) {
        this.logger.warn(
          `Fallo al descifrar body: ${error instanceof Error ? error.message : String(error)}`
        );
        throw new BadRequestException("Error al descifrar el cuerpo de la solicitud.");
      }
    }

    return next.handle();
  }
}
