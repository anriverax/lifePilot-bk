import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class ChangePasswordDto {
  @IsNotEmpty({ message: "La contraseña actual es un campo obligatorio." })
  @IsString()
  @Transform(({ value }) => value.trim())
  currentPassword: string = "";

  @IsNotEmpty({ message: "La nueva contraseña es un campo obligatorio." })
  @IsString()
  @MinLength(8, { message: "La nueva contraseña debe tener al menos 8 caracteres." })
  @MaxLength(12, { message: "La nueva contraseña no puede exceder 12 caracteres." })
  @Transform(({ value }) => value.trim())
  newPassword: string = "";
}
