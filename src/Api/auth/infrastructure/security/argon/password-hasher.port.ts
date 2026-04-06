export const PASSWORD_HASHER = Symbol("PASSWORD_HASHER");
export interface IPasswordHasher {
  hashPassword(password: string): Promise<string>;
  comparePasswords(password: string, hashedPassword: string): Promise<boolean>;
}
