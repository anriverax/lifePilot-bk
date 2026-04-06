/**
 * Gender Value Object
 * Encapsulates gender as a domain value object with behavior
 * Pure domain logic - no external dependencies
 */

enum GenderType {
  FEMALE = "M", // M = Mujer
  MALE = "H" // H = Hombre
}

export class Gender {
  private constructor(private readonly value: GenderType) {}

  static female(): Gender {
    return new Gender(GenderType.FEMALE);
  }

  static male(): Gender {
    return new Gender(GenderType.MALE);
  }

  static from(value: string): Gender {
    if (value === "M" || value === "FEMALE") {
      return Gender.female();
    }
    if (value === "H" || value === "MALE") {
      return Gender.male();
    }
    throw new Error(`Invalid gender value: ${value}`);
  }

  isFemale(): boolean {
    return this.value === GenderType.FEMALE;
  }

  isMale(): boolean {
    return this.value === GenderType.MALE;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Gender): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value === GenderType.FEMALE ? "Mujer" : "Hombre";
  }
}
