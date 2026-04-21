import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class AuthDto {
  @IsNotEmpty({ message: "El correo electrónico es un campo obligatorio." })
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string = "";

  @IsNotEmpty({ message: "La contraseña es un campo obligatorio." })
  @IsString()
  @Transform(({ value }) => value.trim())
  passwd: string = "";
}
