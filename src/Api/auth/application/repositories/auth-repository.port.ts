import { CreateAuthInput } from "../../domain/auth.entity";

export const SYSTEM_USER_ID = 0;

export const AUTH_REPOSITORY = Symbol("AUTH_REPOSITORY");

export interface AuthRepositoryPort {
  create(data: CreateAuthInput): Promise<any>;
}
