import { PrismaService } from "@/services/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { AuthUser } from "../domain/user.entity";
import { RolByUserId } from "../domain/auth.entity";

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdOrEmail(id?: number, email?: string): Promise<AuthUser | null> {
    const where: any = {};
    if (email) where.email = email;
    if (id) where.id = id;

    const user = await this.prisma.user.findUnique({
      where,
      select: {
        id: true,
        email: true,
        image: true,
        emailVerified: true
      }
    });

    return user;
  }

  async findRolByUserId(userId: number): Promise<RolByUserId | null> {
    const userWithRoles = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        roleId: true,
        Roles: {
          select: {
            name: true
          }
        }
      }
    });

    return userWithRoles;
  }

  async getAllUserIdByRoleId(roleId: number): Promise<{ id: number }[]> {
    const users = await this.prisma.user.findMany({
      where: {
        roleId
      },
      select: {
        id: true
      }
    });

    return users;
  }
}
