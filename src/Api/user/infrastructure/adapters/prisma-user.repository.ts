import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/services/prisma/prisma.service";
import { UserEntity } from "../../domain/entities/user.entity";
import {
  CreateUserData,
  UserRepositoryPort,
} from "../../domain/ports/user-repository.port";

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwd: data.passwd,
        roleId: data.roleId,
        personId: data.personId,
        avatar: data.avatar ?? null,
      },
    });

    return user as unknown as UserEntity;
  }

  async findById(id: number): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user as unknown as UserEntity | null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user as unknown as UserEntity | null;
  }
}
