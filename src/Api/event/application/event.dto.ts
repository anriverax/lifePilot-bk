import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  ValidateIf
} from "class-validator";

import { Transform, Type } from "class-transformer";
import { EventType, Priority, State } from "@/prisma/generated/enums";
import { IsNotPastDate } from "@/common/validators/is-not-past-date.validator";

export class EventDto {
  @IsNotEmpty({ message: "El nombre del evento es obligatorio." })
  @Transform(({ value }) => value.trim())
  @IsString({ message: "El nombre del evento debe ser una cadena de texto." })
  title: string = "";

  @IsNotEmpty({ message: "La fecha y hora del evento es obligatoria." })
  @Transform(({ value }) => (value ? new Date(value) : value))
  @IsNotPastDate()
  eventDateAndTime: Date = new Date();

  @IsOptional()
  @IsBoolean({ message: "El campo Recordatorio debe ser un valor booleano." })
  isReminder: boolean = false;

  @IsNotEmpty({ message: "El tipo de evento es obligatorio." })
  @IsEnum(EventType, { message: "El tipo de evento debe ser HITO, CITA MEDICA o MEDICAMENTO." })
  eventType!: EventType;

  @IsNotEmpty({ message: "La prioridad del evento es obligatoria." })
  @IsEnum(Priority, { message: "La prioridad del evento debe ser BAJA, MEDIA o ALTA." })
  priority!: Priority;

  @IsOptional()
  @IsString({ message: "El nombre de la ubicación debe ser una cadena de texto." })
  locationName: string | null = null;

  @IsOptional()
  @IsString({ message: "La dirección de la ubicación debe ser una cadena de texto." })
  locationAddress: string | null = null;

  @IsOptional()
  @IsNumber({}, { message: "La latitud debe ser un número." })
  locationLat: number | null = null;

  @IsOptional()
  @IsNumber({}, { message: "La longitud debe ser un número." })
  locationLng: number | null = null;

  @IsOptional()
  @IsEnum(State, { message: "El estado del evento no es válido." })
  state: State = State.NO_INICIADO;
}

export class GetCalendarEventsDto {
  @ValidateIf((dto) => !dto.month && !dto.year)
  @IsDateString({}, { message: "currentDate debe ser una fecha ISO válida (o use month/year)" })
  currentDate?: string;

  // ── Modo 2: mes + año ──
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}
