import { PrismaClient, RoleType } from "../generated/client";

const ROLES: RoleType[] = [RoleType.ADMIN, RoleType.USER, RoleType.USER_DEMO];

export async function seedRoles(prisma: PrismaClient): Promise<void> {
  const count = await prisma.role.count();

  if (count > 0) {
    console.log("Roles table already has data, skipping seed.");
    return;
  }

  await prisma.role.createMany({
    data: ROLES.map((name) => ({ name })),
  });

  console.log(`Roles seeded: ${ROLES.join(", ")}`);
}
