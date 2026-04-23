import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { IsValidNewPassword } from "@/common/validators/new-password.validator";

export class ChangePasswordDto {
  @IsNotEmpty({ message: "La contraseña actual es un campo obligatorio." })
  @IsString()
  @Transform(({ value }) => value.trim())
  currentPassword: string = "";

  @IsNotEmpty({ message: "La nueva contraseña es un campo obligatorio." })
  @IsString()
  @IsValidNewPassword("currentPassword")
  @Transform(({ value }) => value.trim())
  newPassword: string = "";
}
