import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserUseCase } from "../../application/use-cases/create-user.use-case";
import { CreateUserDto } from "../../application/dtos/create-user.dto";
import { UserEntity } from "../../domain/entities/user.entity";

@Controller("users")
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<Omit<UserEntity, "passwd">> {
    return this.createUserUseCase.execute(dto);
  }
}
