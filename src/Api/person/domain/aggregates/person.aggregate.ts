/**
 * Person Aggregate Root
 * Domain rules and business logic for Person entity
 * This is PURE domain logic - NO external dependencies (no Prisma, no DB calls)
 */

import { Gender } from "../value-objects/gender.value-object";
import { PersonId } from "../value-objects/person-id.value-object";
import { PersonCreatedEvent } from "../events/person-created.event";

export class PersonAggregate {
  private uncommittedEvents: PersonCreatedEvent[] = [];

  private constructor(
    private id: PersonId,
    private firstName: string,
    private lastName: string,
    private address: string,
    private gender: Gender,
    private phoneNumber: string,
    private birthdate: Date | null,
    private districtId: number,
    private createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
    private createdBy: number,
    private updatedBy: number | null,
    private deletedBy: number | null
  ) {}

  /**
   * Factory method to create a new Person aggregate
   * Encapsulates all creation logic and business rules
   * Returns aggregate with uncommitted event
   */
  static create(
    firstName: string,
    lastName: string,
    address: string,
    gender: Gender,
    phoneNumber: string,
    districtId: number,
    birthdate: Date | null,
    createdBy: number
  ): PersonAggregate {
    // Business validations (PURE domain logic)
    if (!firstName || firstName.trim().length === 0) {
      throw new Error("firstName is required");
    }
    if (!lastName || lastName.trim().length === 0) {
      throw new Error("lastName is required");
    }
    if (!address || address.trim().length === 0) {
      throw new Error("address is required");
    }
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      throw new Error("phoneNumber is required");
    }
    if (districtId <= 0) {
      throw new Error("districtId must be valid");
    }

    const now = new Date();
    // ID will be assigned by repository (DB autoincrement)
    const tempId = PersonId.generate();

    const aggregate = new PersonAggregate(
      tempId,
      firstName,
      lastName,
      address,
      gender,
      phoneNumber,
      birthdate,
      districtId,
      now,
      now,
      null,
      createdBy,
      null,
      null
    );

    // Publish domain event
    aggregate.addUncommittedEvent(
      new PersonCreatedEvent(
        tempId.getValue(),
        firstName,
        lastName,
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}@domain.local`,
        gender.getValue(),
        districtId
      )
    );

    return aggregate;
  }

  /**
   * Restore aggregate from persistence (for loading)
   */
  static restore(
    id: number,
    firstName: string,
    lastName: string,
    address: string,
    gender: string,
    phoneNumber: string,
    birthdate: Date | null,
    districtId: number,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
    createdBy: number,
    updatedBy: number | null,
    deletedBy: number | null
  ): PersonAggregate {
    return new PersonAggregate(
      PersonId.from(id),
      firstName,
      lastName,
      address,
      Gender.from(gender),
      phoneNumber,
      birthdate,
      districtId,
      createdAt,
      updatedAt,
      deletedAt,
      createdBy,
      updatedBy,
      deletedBy
    );
  }

  // ============ BUSINESS METHODS ============

  updatePhoneNumber(newPhoneNumber: string, updatedBy: number): void {
    if (!newPhoneNumber || newPhoneNumber.trim().length === 0) {
      throw new Error("Phone number cannot be empty");
    }
    this.phoneNumber = newPhoneNumber;
    this.updatedAt = new Date();
    this.updatedBy = updatedBy;
  }

  updateAddress(newAddress: string, updatedBy: number): void {
    if (!newAddress || newAddress.trim().length === 0) {
      throw new Error("Address cannot be empty");
    }
    this.address = newAddress;
    this.updatedAt = new Date();
    this.updatedBy = updatedBy;
  }

  delete(deletedBy: number): void {
    if (this.isDeleted()) {
      throw new Error("Person is already deleted");
    }
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  // ============ GETTERS ============

  getId(): PersonId {
    return this.id;
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  getAddress(): string {
    return this.address;
  }

  getGender(): Gender {
    return this.gender;
  }

  getPhoneNumber(): string {
    return this.phoneNumber;
  }

  getBirthdate(): Date | null {
    return this.birthdate;
  }

  getDistrictId(): number {
    return this.districtId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  getCreatedBy(): number {
    return this.createdBy;
  }

  getUpdatedBy(): number | null {
    return this.updatedBy;
  }

  getDeletedBy(): number | null {
    return this.deletedBy;
  }

  // ============ EVENT SOURCING ============

  private addUncommittedEvent(event: PersonCreatedEvent): void {
    this.uncommittedEvents.push(event);
  }

  getUncommittedEvents(): PersonCreatedEvent[] {
    return this.uncommittedEvents;
  }

  clearUncommittedEvents(): void {
    this.uncommittedEvents = [];
  }

  applyEvent(event: PersonCreatedEvent): void {
    // Can be used for event replay in event sourcing
    if (event.personId === this.id.getValue()) {
      // Apply event to aggregate state if needed
    }
  }
}
