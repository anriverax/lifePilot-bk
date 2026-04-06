/**
 * Person ID Value Object
 * Encapsulates person identifier with value object semantics
 * Pure domain logic - no external dependencies
 */

export class PersonId {
  private constructor(private readonly value: number) {
    if (value <= 0) {
      throw new Error("PersonId must be a positive number");
    }
  }

  static from(value: number): PersonId {
    return new PersonId(value);
  }

  static generate(): PersonId {
    // Will be assigned by DB, but this supports domain logic
    return new PersonId(Math.floor(Math.random() * 1000000));
  }

  getValue(): number {
    return this.value;
  }

  equals(other: PersonId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }
}
