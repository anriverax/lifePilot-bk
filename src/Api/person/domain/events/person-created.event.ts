/**
 * Domain Event: Person Created
 * Fired when a new person is created
 * Pure domain event - no external dependencies
 */

export class PersonCreatedEvent {
  constructor(
    public readonly personId: number,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly gender: string,
    public readonly districtId: number,
    public readonly timestamp: Date = new Date()
  ) {}

  getAggregateId(): number {
    return this.personId;
  }
}
