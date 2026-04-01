import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { UserEntity } from "../../domain/entities/user.entity";
import {
  USER_REPOSITORY,
  UserRepositoryPort,
  CreateUserData,
} from "../../domain/ports/user-repository.port";
import { CreateUserDto } from "../dtos/create-user.dto";
import * as bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(dto: CreateUserDto): Promise<Omit<UserEntity, "passwd">> {
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException("El correo electrónico ya está registrado.");
    }

    const hashedPassword = await bcrypt.hash(dto.passwd, SALT_ROUNDS);

    const data: CreateUserData = {
      email: dto.email,
      passwd: hashedPassword,
      roleId: dto.roleId,
      personId: dto.personId,
      avatar: dto.avatar ?? null,
    };

    const user = await this.userRepository.create(data);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwd, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
