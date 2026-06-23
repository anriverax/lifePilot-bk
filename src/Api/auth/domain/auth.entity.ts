import { MenuItem } from "@/prisma/generated/client";
import { ActionType, RoleType } from "@/prisma/generated/enums";
import { UserSession } from "@thallesp/nestjs-better-auth";

export enum Gender {
  M = "M",
  F = "F"
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  countryCode: string;
  gender: Gender;
  phoneNumber: string;
  birthdate: Date;
  email: string;
  passwd: string;
  confirmPassword: string;
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

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
export interface RequestLoginOtpInput {
  email: string;
}

export interface LoginWithOtpInput {
  email: string;
  otp: string;
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

export interface RolByUserId {
  roleId: number;
  Roles: {
    name: string;
  };
}

export interface AuthorizationPermission {
  resource: string;
  action: ActionType;
}

export type AuthorizationMenuItem = MenuItem & { Children: AuthorizationMenuItem[] };

export interface AuthorizationSnapshot {
  roleId: number;
  roleName: RoleType | null;
  permissions: AuthorizationPermission[];
  menu: AuthorizationMenuItem[];
}

export type FlatMenuItem = Omit<AuthorizationMenuItem, "Children">;

export interface AuthorizationCachePayload {
  roleId: number;
  roleName: RoleType | null;
  permissions: AuthorizationPermission[];
  menu: FlatMenuItem[];
}

export interface AuthorizationSnapshotOptions {
  forceRefresh?: boolean;
}

export interface BootstrapResponse {
  user: UserSession["user"];
  roleName: RoleType | null;
  permissions: AuthorizationPermission[];
  menu: AuthorizationMenuItem[];
}

export type ProfileResponse = UserSession["user"] & {
  roleName: string | null;
};
