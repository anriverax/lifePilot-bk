import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";

@ValidatorConstraint({ name: "isNotPastDate", async: false })
export class IsNotPastDateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    const date = value instanceof Date ? value : new Date(value as string);

    if (isNaN(date.getTime())) {
      return false;
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return date.getTime() >= startOfToday.getTime();
  }

  defaultMessage(): string {
    return "La fecha y hora del evento no puede ser anterior al día de hoy.";
  }
}

export function IsNotPastDate(validationOptions?: ValidationOptions): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      name: "isNotPastDate",
      target: object.constructor,
      propertyName: propertyName.toString(),
      options: validationOptions,
      validator: IsNotPastDateConstraint
    });
  };
}
