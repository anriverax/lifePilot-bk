import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";

interface PasswordRule {
  isValid: (value: string) => boolean;
  message: string;
}

const MIN_LENGTH = 8;
const MAX_LENGTH = 12;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

const PASSWORD_RULES: PasswordRule[] = [
  {
    isValid: (v) => v.length >= MIN_LENGTH,
    message: `La nueva contraseña debe tener al menos ${MIN_LENGTH} caracteres.`
  },
  {
    isValid: (v) => v.length <= MAX_LENGTH,
    message: `La nueva contraseña no puede exceder ${MAX_LENGTH} caracteres.`
  },
  { isValid: (v) => !/\s/.test(v), message: "La nueva contraseña no puede contener espacios." },
  {
    isValid: (v) => /[a-z]/.test(v),
    message: "La nueva contraseña debe incluir al menos una letra minúscula."
  },
  {
    isValid: (v) => /[A-Z]/.test(v),
    message: "La nueva contraseña debe incluir al menos una letra mayúscula."
  },
  { isValid: (v) => /\d/.test(v), message: "La nueva contraseña debe incluir al menos un número." },
  {
    isValid: (v) => SPECIAL_CHAR_REGEX.test(v),
    message: "La nueva contraseña debe incluir al menos un carácter especial."
  }
];

@ValidatorConstraint({ name: "isValidNewPassword", async: false })
export class IsValidNewPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (typeof value !== "string") return false;

    const failsBaseRules = PASSWORD_RULES.some((rule) => !rule.isValid(value));
    if (failsBaseRules) return false;

    return !this.matchesCurrentPassword(value, args);
  }

  defaultMessage(args: ValidationArguments): string {
    const value = args.value;

    if (typeof value !== "string") {
      return "La nueva contraseña debe ser una cadena de texto.";
    }

    // ✅ Una sola fuente de verdad — el primer rule que falle define el mensaje
    const failedRule = PASSWORD_RULES.find((rule) => !rule.isValid(value));
    if (failedRule) return failedRule.message;

    if (this.matchesCurrentPassword(value, args)) {
      return "La nueva contraseña debe ser diferente a la actual.";
    }

    return "La nueva contraseña no cumple las reglas de seguridad.";
  }

  private matchesCurrentPassword(value: string, args: ValidationArguments): boolean {
    const [currentPasswordField] = args.constraints as [string];
    const object = args.object as Record<string, unknown>;
    const currentPassword = object[currentPasswordField];

    return typeof currentPassword === "string" && value === currentPassword;
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
