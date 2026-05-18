import { ActionType, PrismaClient, RoleType } from "../generated/client";

const ROLES: RoleType[] = [RoleType.ADMIN, RoleType.USER, RoleType.USER_DEMO];
export const RESOURCES: string[] = [
  "calendar",
  "pantry",
  "meals",
  "grocery_list",
  "routines",
  "habits",
  "progress",
  "documents",
  "settings",
  "notifications"
];

const ACTIONS: ActionType[] = [
  ActionType.READ,
  ActionType.CREATE,
  ActionType.UPDATE,
  ActionType.DELETE,
  ActionType.UPLOAD
];

type RolePermissionSeedConfig = {
  resources: string[];
  actions: ActionType[];
};

const RESOURCE_ACTIONS_CONFIG: Record<string, ActionType[]> = {
  calendar: [ActionType.READ, ActionType.CREATE, ActionType.UPDATE, ActionType.DELETE],
  pantry: [ActionType.READ, ActionType.CREATE, ActionType.UPDATE, ActionType.DELETE],
  meals: [ActionType.READ, ActionType.CREATE, ActionType.UPDATE, ActionType.DELETE],
  grocery_list: [ActionType.READ, ActionType.CREATE, ActionType.UPDATE, ActionType.DELETE],
  routines: [ActionType.READ, ActionType.CREATE, ActionType.UPDATE, ActionType.DELETE],
  habits: [ActionType.READ, ActionType.CREATE, ActionType.UPDATE, ActionType.DELETE],
  progress: [ActionType.READ],
  documents: [ActionType.READ, ActionType.CREATE, ActionType.UPDATE, ActionType.DELETE, ActionType.UPLOAD],
  settings: [ActionType.READ, ActionType.UPDATE],
  notifications: [ActionType.READ, ActionType.UPDATE]
};

const DEMO_RESOURCES: string[] = RESOURCES.filter((resource) => resource !== "settings");

const ROLE_PERMISSION_CONFIG: Record<RoleType, RolePermissionSeedConfig> = {
  [RoleType.ADMIN]: {
    resources: RESOURCES,
    actions: ACTIONS
  },
  [RoleType.USER]: {
    resources: RESOURCES,
    actions: ACTIONS
  },
  [RoleType.USER_DEMO]: {
    resources: DEMO_RESOURCES,
    actions: ACTIONS
  }
};

export async function seedRoles(prisma: PrismaClient): Promise<void> {
  await prisma.role.createMany({
    data: ROLES.map((name) => ({ name })),
    skipDuplicates: true
  });
}

export async function seedResources(prisma: PrismaClient): Promise<void> {
  await prisma.resource.createMany({
    data: RESOURCES.map((name) => ({ name })),
    skipDuplicates: true
  });

  const listResources = await prisma.resource.findMany({
    where: {
      name: {
        in: RESOURCES
      }
    },
    select: {
      id: true,
      name: true
    }
  });

  await prisma.permission.createMany({
    data: listResources.flatMap((resource) =>
      (RESOURCE_ACTIONS_CONFIG[resource.name] ?? []).map((action) => ({
        resourceId: resource.id,
        action
      }))
    ),
    skipDuplicates: true
  });

  const totalPermissions = listResources.reduce(
    (total, resource) => total + (RESOURCE_ACTIONS_CONFIG[resource.name]?.length ?? 0),
    0
  );

  console.log(
    `Resources seeded/verified: ${listResources.length}. Permissions seeded/verified: ${totalPermissions}.`
  );
}

export async function seedRolePermissions(prisma: PrismaClient): Promise<void> {
  const roles = await prisma.role.findMany({
    where: {
      name: {
        in: ROLES
      }
    },
    select: {
      id: true,
      name: true
    }
  });

  const permissions = await prisma.permission.findMany({
    where: {
      Resource: {
        name: {
          in: RESOURCES
        }
      }
    },
    select: {
      id: true,
      action: true,
      Resource: {
        select: {
          name: true
        }
      }
    }
  });

  const permissionByKey = new Map(
    permissions.map((permission) => [`${permission.Resource.name}:${permission.action}`, permission.id])
  );

  const rolePermissions = roles.flatMap((role) => {
    const config = ROLE_PERMISSION_CONFIG[role.name];

    return config.resources.flatMap((resourceName) =>
      (RESOURCE_ACTIONS_CONFIG[resourceName] ?? config.actions).flatMap((action) => {
        const permissionId = permissionByKey.get(`${resourceName}:${action}`);

        if (!permissionId) {
          return [];
        }

        return {
          roleId: role.id,
          permissionId
        };
      })
    );
  });

  await prisma.rolePermission.createMany({
    data: rolePermissions,
    skipDuplicates: true
  });

  console.log(`Role permissions seeded/verified: ${rolePermissions.length}.`);
}
