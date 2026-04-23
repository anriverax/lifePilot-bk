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

export interface AuthInput {
  email: string;
  passwd: string;
}

export interface AuthResponse {
  token: string;
  redirect: boolean;
  url?: string;
  user: {
    name: string;
    email: string;
    image: unknown;
    roleId: number;
    id: number | string;
  };
}
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
