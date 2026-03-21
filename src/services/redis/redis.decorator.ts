import { Inject } from "@nestjs/common";
import { REDIS_CLIENT } from "./redis.core";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type */

/**
 * Decorador de parámetro que inyecta el cliente de Redis registrado bajo el token `REDIS_CLIENT`.
 * Úsalo en los constructores de los servicios que necesiten acceso directo al cliente de Redis.
 * @example
 * constructor(@InjectRedis() private readonly redis: Redis) {}
 */
export const InjectRedis = () => Inject(REDIS_CLIENT);
