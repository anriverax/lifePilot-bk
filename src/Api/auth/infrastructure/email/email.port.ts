export const SYSTEM_USER_ID = 0;

export const EMAIL_ADAPTER = Symbol("EMAIL_ADAPTER");

export interface IEmailPort {
  verifyEmail(email: string, passwd: string): Promise<void>;
}
