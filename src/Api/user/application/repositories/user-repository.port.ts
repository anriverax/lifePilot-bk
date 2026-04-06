import { FindUserByIdOrEmailResponse } from '../../domain/entities/user.entity';

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface UserRepositoryPort {
  findByIdOrEmail(id?: number, email?: string): Promise<FindUserByIdOrEmailResponse | null>;
}
