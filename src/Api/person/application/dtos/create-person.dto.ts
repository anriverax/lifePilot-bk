import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Gender } from "../../domain/entities/person.entity";

export class CreatePersonDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @IsInt()
  districtId!: number;
}
