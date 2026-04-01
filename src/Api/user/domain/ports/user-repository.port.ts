import { UserEntity } from "../entities/user.entity";

export interface CreateUserData {
  email: string;
  passwd: string;
  roleId: number;
  personId: number;
  avatar?: string | null;
}

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface UserRepositoryPort {
  create(data: CreateUserData): Promise<UserEntity>;
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
}
