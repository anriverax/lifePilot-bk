export enum Gender {
  M = "M",
  H = "H"
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  address: string;
  gender: Gender;
  phoneNumber: string;
  birthdate: Date;
  email: string;
  passwd: string;
}

export interface CreateUserWithCreator extends Omit<CreateUserInput, "email" | "passwd" | "roleId"> {
  userId: number;
  createdBy: number;
}

export interface VerifyEmailOtp {
  email: string;
  otp: string;
}
