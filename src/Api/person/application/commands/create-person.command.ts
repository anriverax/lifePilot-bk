/**
 * Create Person Command
 * CQRS Command - represents a write operation to create a new person
 */

export class CreatePersonCommand {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly address: string,
    public readonly gender: string,
    public readonly phoneNumber: string,
    public readonly districtId: number,
    public readonly birthdate?: Date | null,
    public readonly createdBy?: number
  ) {}
}
