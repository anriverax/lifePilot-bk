import { MenuItem } from "@/prisma/generated/client";
import { ActionType } from "@/prisma/generated/enums";

export interface RolePermissions {
  Permission: {
    action: ActionType;
    Resource: {
      name: string;
    };
  };
}

export interface RolePermissionsResponse {
  rolePermissions: RolePermissions[];

  menu: MenuItem[];
}
