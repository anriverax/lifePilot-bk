/**
 * Get Person By ID Query
 * CQRS Query - represents a read operation to get a single person
 */

export class GetPersonByIdQuery {
  constructor(public readonly id: number) {}
}
