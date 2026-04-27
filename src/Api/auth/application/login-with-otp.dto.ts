import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class LoginWithOtpDto {
  @IsNotEmpty({ message: "El correo electrónico es un campo obligatorio." })
  @Transform(({ value }) => value.toLowerCase().trim())
  @IsString({ message: "El correo electrónico debe ser una cadena de texto." })
  @IsEmail()
  @Matches(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
  email: string = "";

  @IsNotEmpty({ message: "El OTP es un campo obligatorio." })
  @IsString()
  @Length(6, 6, { message: "El OTP debe tener exactamente 6 dígitos." })
  otp: string = "";
}
