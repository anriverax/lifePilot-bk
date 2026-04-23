import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])\S+$/;

@ValidatorConstraint({ name: "isValidNewPassword", async: false })
export class IsValidNewPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (typeof value !== "string") {
      return false;
    }

    if (value.length < 8 || value.length > 12) {
      return false;
    }

    if (!STRONG_PASSWORD_REGEX.test(value)) {
      return false;
    }

    const [currentPasswordField] = args.constraints as [string];
    const object = args.object as Record<string, unknown>;
    const currentPassword = object[currentPasswordField];

    if (typeof currentPassword === "string" && value === currentPassword) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const value = args.value;

    if (typeof value !== "string") {
      return "La nueva contraseña debe ser una cadena de texto.";
    }

    if (value.length < 8) {
      return "La nueva contraseña debe tener al menos 8 caracteres.";
    }

    if (value.length > 12) {
      return "La nueva contraseña no puede exceder 12 caracteres.";
    }

    if (/\s/.test(value)) {
      return "La nueva contraseña no puede contener espacios.";
    }

    if (!/[a-z]/.test(value)) {
      return "La nueva contraseña debe incluir al menos una letra minúscula.";
    }

    if (!/[A-Z]/.test(value)) {
      return "La nueva contraseña debe incluir al menos una letra mayúscula.";
    }

    if (!/\d/.test(value)) {
      return "La nueva contraseña debe incluir al menos un número.";
    }

    if (!/[^\w\s]/.test(value)) {
      return "La nueva contraseña debe incluir al menos un carácter especial.";
    }

    const [currentPasswordField] = args.constraints as [string];
    const object = args.object as Record<string, unknown>;
    const currentPassword = object[currentPasswordField];

    if (typeof currentPassword === "string" && value === currentPassword) {
      return "La nueva contraseña debe ser diferente a la actual.";
    }

    return "La nueva contraseña no cumple las reglas de seguridad.";
  }
}

export function IsValidNewPassword(
  currentPasswordField: string,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      name: "isValidNewPassword",
      target: object.constructor,
      propertyName: propertyName.toString(),
      constraints: [currentPasswordField],
      options: validationOptions,
      validator: IsValidNewPasswordConstraint
    });
  };
}

/*
Debe ser string.
Mínimo 8 y máximo 12 caracteres.
Sin espacios.
Al menos 1 minúscula.
Al menos 1 mayúscula.
Al menos 1 número.
Al menos 1 carácter especial.
Debe ser distinta de currentPassword.
*/
