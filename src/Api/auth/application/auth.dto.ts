import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class AuthDto {
  @IsNotEmpty({ message: "El correo electrónico es un campo obligatorio." })
  @IsString()
  @IsEmail()
  email: string = "";

  @IsNotEmpty({ message: "La contraseña es un campo obligatorio." })
  @IsString()
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres." })
  @MaxLength(12, { message: "La contraseña no puede exceder 12 caracteres." })
  passwd: string = "";
}
