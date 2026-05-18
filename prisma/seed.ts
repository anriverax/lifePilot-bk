import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "./generated/client";
import { seedResources, seedRolePermissions, seedRoles } from "./seeds/rbac.seed";
import { seedMenuItem, seedRoleMenus } from "./seeds/menu.seed";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main(): Promise<void> {
  await seedRoles(prisma);
  await seedResources(prisma);
  await seedRolePermissions(prisma);
  await seedMenuItem(prisma);
  await seedRoleMenus(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
