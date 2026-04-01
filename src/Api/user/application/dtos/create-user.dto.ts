import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  passwd!: string;

  @IsInt()
  roleId!: number;

  @IsInt()
  personId!: number;

  @IsOptional()
  @IsString()
  avatar?: string;
}
