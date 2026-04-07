import { Transform } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from "class-validator";
import { Gender } from "../domain/auth.entity";
import { decryptTextTransformer } from "@/common/helpers/functions";

export class AuthDto {
  @IsNotEmpty({ message: "El nombre es obligatorio." })
  @Transform(({ value }) => value.trim())
  @IsString({ message: "El nombre debe ser una cadena de texto." })
  firstName: string = "";

  @IsNotEmpty({ message: "El primer apellido es obligatorio." })
  @Transform(({ value }) => value.trim())
  @IsString({ message: "El primer apellido debe ser una cadena de texto." })
  lastName: string = "";

  @IsNotEmpty({ message: "La dirección es obligatoria." })
  @Transform(({ value }) => value.trim())
  @IsString({ message: "La dirección debe ser una cadena de texto." })
  address: string = "";

  @IsNotEmpty({ message: "El genero es obligatorio." })
  @IsString({ message: "El género debe ser una cadena de texto." })
  @IsEnum(Gender, { message: "El género debe ser M o H." })
  @IsIn(["M", "H"], { message: "El género debe ser 'M' o 'H'." })
  gender: Gender = null as any;

  @IsNotEmpty({ message: "El teléfono es obligatorio." })
  @Transform(({ value }) => value.trim())
  @IsString({ message: "El teléfono debe ser una cadena de texto." })
  @Matches(/^(2|6|7)\d{3}-\d{4}$/)
  phoneNumber: string = "";

  @IsOptional()
  @Transform(({ value }) => value)
  birthdate: Date | null = null;

  @IsNotEmpty({ message: "El distrito es obligatorio." })
  @IsNumber()
  districtId: number = 0;

  // The user's e-mail address.
  @IsNotEmpty({ message: "El correo electrónico es un campo obligatorio." })
  @Transform(({ value }) => value.trim())
  @IsString({ message: "La correo electrónico debe ser una cadena de texto." })
  @IsEmail()
  @Matches(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )
  email: string = "";

  // The user's password.
  @IsNotEmpty({ message: "La contraseña es un campo obligatorio." })
  @Transform(({ value }) => decryptTextTransformer(value as string))
  @IsString({ message: "La contraseña debe ser una cadena de texto válida." })
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres." })
  @MaxLength(12, { message: "La contraseña no puede exceder 12 caracteres." })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "La contraseña debe contener al menos una mayúscula, una minúscula y un número."
  })
  passwd: string = "";
}
