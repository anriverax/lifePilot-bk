import { Inject } from "@nestjs/common";
import { REDIS_CLIENT } from "./redis.core";

/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type */

export const InjectRedis = () => Inject(REDIS_CLIENT);
