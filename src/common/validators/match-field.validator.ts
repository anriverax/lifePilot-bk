import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";

@ValidatorConstraint({ name: "matchField", async: false })
export class MatchFieldConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints as [string];
    const object = args.object as Record<string, unknown>;

    return value === object[relatedPropertyName];
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints as [string];

    return `${args.property} debe coincidir con ${relatedPropertyName}.`;
  }
}

export function MatchField(
  relatedPropertyName: string,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName.toString(),
      options: validationOptions,
      constraints: [relatedPropertyName],
      validator: MatchFieldConstraint
    });
  };
}
