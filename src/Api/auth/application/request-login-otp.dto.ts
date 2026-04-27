import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";

export class RequestLoginOtpDto {
  @IsNotEmpty({ message: "El correo electrónico es un campo obligatorio." })
  @Transform(({ value }) => value.toLowerCase().trim())
  @IsString({ message: "El correo electrónico debe ser una cadena de texto." })
  @IsEmail()
  @Matches(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
  email: string = "";
}
