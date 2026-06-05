import { Injectable, UnauthorizedException } from "@nestjs/common";
import { RoleType } from "@/prisma/generated/client";
import { RedisService } from "@/services/redis/redis.service";
import { UserRepository } from "@/api/auth/repositories/user.repository";
import { RolPermissionRepository } from "@/api/auth/repositories/rolPermission.repository";
import {
  AuthorizationCachePayload,
  AuthorizationMenuItem,
  AuthorizationSnapshot,
  AuthorizationSnapshotOptions,
  FlatMenuItem
} from "../domain/auth.entity";

@Injectable()
export class AuthorizationService {
  private static readonly CACHE_TTL_SECONDS = 300;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly rolePermissionRepository: RolPermissionRepository,
    private readonly redis: RedisService
  ) {}

  async getAuthorizationSnapshot(
    userId: number | string,
    options?: AuthorizationSnapshotOptions
  ): Promise<AuthorizationSnapshot> {
    const parsedUserId = this.parseUserId(userId);
    const forceRefresh = options?.forceRefresh ?? false;

    if (!forceRefresh) {
      const cachedPayload = await this.redis.get<AuthorizationCachePayload>(
        this.getAuthorizationCacheKey(parsedUserId)
      );

      if (cachedPayload) {
        return this.toAuthorizationSnapshot(cachedPayload);
      }
    }

    const freshPayload = await this.buildAuthorizationPayload(parsedUserId);

    await this.redis.set(
      this.getAuthorizationCacheKey(parsedUserId),
      freshPayload,
      AuthorizationService.CACHE_TTL_SECONDS
    );

    return this.toAuthorizationSnapshot(freshPayload);
  }

  async primeAuthorizationCache(userId: number | string): Promise<AuthorizationSnapshot> {
    return this.getAuthorizationSnapshot(userId, { forceRefresh: true });
  }

  async invalidateUserAuthorizationCache(userId: number | string): Promise<void> {
    const parsedUserId = this.parseUserId(userId);

    await this.redis.del(this.getAuthorizationCacheKey(parsedUserId));
  }

  async invalidateAuthorizationByUserRoleChange(userId: number | string): Promise<void> {
    await this.invalidateUserAuthorizationCache(userId);
  }

  async invalidateAuthorizationByRolePermissionChange(roleId: number): Promise<void> {
    await this.invalidateAuthorizationByRoleId(roleId);
  }

  async invalidateAuthorizationByRoleMenuChange(roleId: number): Promise<void> {
    await this.invalidateAuthorizationByRoleId(roleId);
  }

  async invalidateAuthorizationByRoleId(roleId: number): Promise<void> {
    const users = await this.userRepository.getAllUserIdByRoleId(roleId);

    if (users.length === 0) {
      return;
    }

    await Promise.all(users.map((user) => this.redis.del(this.getAuthorizationCacheKey(user.id))));
  }

  private parseUserId(userId: number | string): number {
    const parsedUserId = Number(userId);

    if (Number.isNaN(parsedUserId)) {
      throw new UnauthorizedException("La sesión actual no tiene un usuario válido");
    }

    return parsedUserId;
  }

  private async buildAuthorizationPayload(userId: number): Promise<AuthorizationCachePayload> {
    const user = await this.userRepository.findRolByUserId(userId);

    if (!user) {
      throw new UnauthorizedException("Usuario no encontrado");
    }

    const roleId = user.roleId;
    const roleName = user.Roles.name ?? null;

    const rolePermissionsData = await this.rolePermissionRepository.findPermissionsByRoleId(roleId);

    const { rolePermissions, menu } = rolePermissionsData;

    const permissions = rolePermissions.map(({ Permission }) => ({
      resource: Permission.Resource.name,
      action: Permission.action
    }));

    return {
      roleId,
      roleName: roleName as RoleType | null,
      permissions,
      menu
    };
  }

  private toAuthorizationSnapshot(payload: AuthorizationCachePayload): AuthorizationSnapshot {
    return {
      roleId: payload.roleId,
      roleName: payload.roleName,
      permissions: payload.permissions,
      menu: this.buildMenuTree(payload.menu)
    };
  }

  private buildMenuTree(menuItems: FlatMenuItem[]): AuthorizationMenuItem[] {
    const nodes = new Map<number, AuthorizationMenuItem>();
    const tree: AuthorizationMenuItem[] = [];

    for (const item of menuItems) {
      nodes.set(item.id, {
        ...item,
        Children: []
      });
    }

    for (const item of menuItems) {
      const currentNode = nodes.get(item.id);

      if (!currentNode) {
        continue;
      }

      if (item.parentId === null) {
        tree.push(currentNode);
        continue;
      }

      const parentNode = nodes.get(item.parentId);

      if (parentNode) {
        parentNode.Children.push(currentNode);
      }
    }

    return tree;
  }

  private getAuthorizationCacheKey(userId: number): string {
    return `auth:user:${userId}:authorization`;
  }
}

/*
Qué todavía debes tener en mente
Este archivo solo prepara la infraestructura. La invalidación explícita existe, pero todavía hay que llamarla desde los casos de uso donde:

cambies roleId de un usuario
modifiques RolePermission
modifiques RoleMenu
*/
