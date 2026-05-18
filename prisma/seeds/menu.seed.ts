import { PrismaClient, RoleType } from "../generated/client";
import { RESOURCES } from "./rbac.seed";

type MenuSeedItem = {
  key: string;
  title: string;
  path: string;
  icon: string;
  order: number;
  parentKey?: string;
};

type RoleMenuSeedConfig = {
  menus: string[];
};

const MENU_ITEMS: MenuSeedItem[] = [
  {
    key: "calendar",
    title: "Calendario",
    path: "/calendario",
    icon: "CalendarDays",
    order: 1
  },
  {
    key: "food",
    title: "Alimentación",
    path: "#",
    icon: "ShoppingBasket",
    order: 2
  },
  {
    key: "pantry",
    title: "Despensa",
    path: "/alimentacion/despensa",
    icon: "ChefHat",
    order: 2.1,
    parentKey: "food"
  },
  {
    key: "meals",
    title: "Comidas",
    path: "/alimentacion/comidas",
    icon: "UtensilsCrossed",
    order: 2.2,
    parentKey: "food"
  },
  {
    key: "grocery_list",
    title: "Supermercado",
    path: "/alimentacion/supermercado",
    icon: "ShoppingCart",
    order: 2.3,
    parentKey: "food"
  },
  {
    key: "lifestyle",
    title: "Estilo de Vida",
    path: "#",
    icon: "HandHeart",
    order: 3
  },
  {
    key: "routines",
    title: "Rutinas",
    path: "/estilo-de-vida/rutinas",
    icon: "Dumbbell",
    order: 3.1,
    parentKey: "lifestyle"
  },
  {
    key: "habits",
    title: "Hábitos",
    path: "/estilo-de-vida/habitos",
    icon: "Smile",
    order: 3.2,
    parentKey: "lifestyle"
  },
  {
    key: "progress",
    title: "Progreso",
    path: "/estilo-de-vida/progreso",
    icon: "LineChart",
    order: 3.3,
    parentKey: "lifestyle"
  },
  {
    key: "documents",
    title: "Documentos",
    path: "/documentos",
    icon: "FolderHeart",
    order: 4
  },
  {
    key: "settings",
    title: "Ajustes",
    path: "/ajustes",
    icon: "Settings",
    order: 5
  },
  {
    key: "notifications",
    title: "Notificaciones",
    path: "/notificaciones",
    icon: "Bell",
    order: 6
  }
];

const MENU_KEYS: string[] = MENU_ITEMS.map((item) => item.key);
const USER_DEMO_MENU_KEYS: string[] = MENU_KEYS.filter((key) => key !== "settings");

const ROLE_MENU_CONFIG: Record<RoleType, RoleMenuSeedConfig> = {
  [RoleType.ADMIN]: {
    menus: MENU_KEYS
  },
  [RoleType.USER]: {
    menus: MENU_KEYS
  },
  [RoleType.USER_DEMO]: {
    menus: USER_DEMO_MENU_KEYS
  }
};

export async function seedMenuItem(prisma: PrismaClient): Promise<void> {
  const rootItems = MENU_ITEMS.filter((item) => !item.parentKey);
  const childItems = MENU_ITEMS.filter((item) => item.parentKey);

  const resources = await prisma.resource.findMany({
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

  const resourceIdByKey = new Map(resources.map((resource) => [resource.name, resource.id]));

  const existingMenuItems = await prisma.menuItem.findMany({
    select: {
      id: true,
      title: true,
      path: true,
      parentId: true,
      resourceId: true
    }
  });

  const existingMenuKey = new Set(existingMenuItems.map((item) => `${item.title}:${item.path}`));

  const rootItemsToCreate = rootItems
    .filter((item) => !existingMenuKey.has(`${item.title}:${item.path}`))
    .map(({ key, title, path, icon, order }) => ({
      title,
      path,
      icon,
      order,
      resourceId: resourceIdByKey.get(key) ?? null
    }));

  if (rootItemsToCreate.length > 0) {
    await prisma.menuItem.createMany({
      data: rootItemsToCreate
    });
  }

  const currentMenuItems = await prisma.menuItem.findMany({
    select: {
      id: true,
      title: true,
      path: true,
      parentId: true,
      resourceId: true
    }
  });

  const menuItemByKey = new Map(
    rootItems.map((item) => {
      const menuItem = currentMenuItems.find(
        (currentItem) => currentItem.title === item.title && currentItem.path === item.path
      );

      if (!menuItem) {
        throw new Error(`Menu parent not found for key: ${item.key}`);
      }

      return [item.key, menuItem.id];
    })
  );

  const childItemsToCreate = childItems.flatMap((item) => {
    const parentId = menuItemByKey.get(item.parentKey as string);

    if (!parentId) {
      throw new Error(`Menu parentId not found for child key: ${item.key}`);
    }

    const alreadyExists = currentMenuItems.some(
      (currentItem) =>
        currentItem.title === item.title &&
        currentItem.path === item.path &&
        currentItem.parentId === parentId
    );

    if (alreadyExists) {
      return [];
    }

    return {
      title: item.title,
      path: item.path,
      icon: item.icon,
      order: item.order,
      parentId,
      resourceId: resourceIdByKey.get(item.key) ?? null
    };
  });

  if (childItemsToCreate.length > 0) {
    await prisma.menuItem.createMany({
      data: childItemsToCreate
    });
  }

  const menuItemsToSync = await prisma.menuItem.findMany({
    select: {
      id: true,
      title: true,
      path: true,
      parentId: true,
      resourceId: true
    }
  });

  for (const item of MENU_ITEMS) {
    const expectedResourceId = resourceIdByKey.get(item.key) ?? null;
    const menuItem = menuItemsToSync.find(
      (currentItem) =>
        currentItem.title === item.title &&
        currentItem.path === item.path &&
        (item.parentKey ? currentItem.parentId !== null : currentItem.parentId === null)
    );

    if (!menuItem || menuItem.resourceId === expectedResourceId) {
      continue;
    }

    await prisma.menuItem.update({
      where: {
        id: menuItem.id
      },
      data: {
        resourceId: expectedResourceId
      }
    });
  }

  console.log(`Menu items seeded/verified: ${MENU_ITEMS.length}.`);
}

export async function seedRoleMenus(prisma: PrismaClient): Promise<void> {
  const roles = await prisma.role.findMany({
    where: {
      name: {
        in: Object.values(RoleType)
      }
    },
    select: {
      id: true,
      name: true
    }
  });

  const menuItems = await prisma.menuItem.findMany({
    select: {
      id: true,
      title: true,
      path: true,
      parentId: true
    }
  });

  const menuItemByKey = new Map(
    MENU_ITEMS.map((item) => {
      const menuItem = menuItems.find(
        (currentItem) =>
          currentItem.title === item.title &&
          currentItem.path === item.path &&
          (item.parentKey ? currentItem.parentId !== null : currentItem.parentId === null)
      );

      if (!menuItem) {
        throw new Error(`Menu item not found for key: ${item.key}`);
      }

      return [item.key, menuItem.id];
    })
  );

  const roleMenus = roles.flatMap((role) => {
    const config = ROLE_MENU_CONFIG[role.name];

    return config.menus.flatMap((menuKey) => {
      const menuItemId = menuItemByKey.get(menuKey);

      if (!menuItemId) {
        return [];
      }

      return {
        roleId: role.id,
        menuItemId
      };
    });
  });

  await prisma.roleMenu.createMany({
    data: roleMenus,
    skipDuplicates: true
  });

  console.log(`Role menus seeded/verified: ${roleMenus.length}.`);
}
