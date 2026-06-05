import { ActionType } from "@/prisma/generated/enums";
import { PrismaService } from "@/services/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { RolePermissionsResponse } from "../domain/rolPermission.entity";

@Injectable()
export class RolPermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPermissionsByRoleId(roleId: number): Promise<RolePermissionsResponse> {
    const [rolePermissions, menu] = await Promise.all([
      this.prisma.rolePermission.findMany({
        where: {
          roleId
        },
        select: {
          Permission: {
            select: {
              action: true,
              Resource: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }),
      this.prisma.menuItem.findMany({
        where: {
          RoleMenus: {
            some: {
              roleId
            }
          },
          OR: [
            {
              resourceId: null
            },
            {
              Resource: {
                permissions: {
                  some: {
                    action: ActionType.READ,
                    RolePermissions: {
                      some: {
                        roleId
                      }
                    }
                  }
                }
              }
            }
          ]
        },
        orderBy: {
          order: "asc"
        },
        select: {
          id: true,
          title: true,
          path: true,
          icon: true,
          sub: true,
          order: true,
          parentId: true,
          resourceId: true
        }
      })
    ]);

    return {
      rolePermissions,
      menu
    };
  }
}
