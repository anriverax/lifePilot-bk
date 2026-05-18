import { SetMetadata } from "@nestjs/common";
import { ActionType } from "@/prisma/generated/client";

export interface RequiredPermission {
  resource: string;
  action: ActionType;
}

export const PERMISSIONS_KEY = "permissions";

export const RequirePermissions = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
