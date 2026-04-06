import { PrismaService } from "@/services/prisma/prisma.service";

import { UserRepositoryPort } from "./user-repository.port";
import { FindUserByIdOrEmailResponse } from '../../domain/entities/user.entity';

export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdOrEmail(id?: number, email?: string): Promise<FindUserByIdOrEmailResponse | null> {
    const where: any = {};
    if (email) where.email = email;
    if (id) where.id = id;

    const user = await this.prisma.user.findUnique({
      where,
      select: {
        id: true,
        email: true,
        passwd: true,
        avatar: true,
        emailVerified: true,
        personId: true
      }
    });

    return user;
  }
}
