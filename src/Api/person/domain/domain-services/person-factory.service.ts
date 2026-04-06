/**
 * Person Factory Domain Service
 * Pure domain service - handles Person aggregate creation with domain rules
 * NO external dependencies - pure TypeScript logic
 */

import { PersonAggregate } from "../aggregates/person.aggregate";
import { Gender } from "../value-objects/gender.value-object";

export interface CreatePersonDomainInput {
  firstName: string;
  lastName: string;
  address: string;
  gender: string;
  phoneNumber: string;
  birthdate?: Date | null;
  districtId: number;
  createdBy?: number;
}

export class PersonFactoryService {
  /**
   * Create a new Person aggregate with all domain validations
   * Pure domain logic - can be tested without any external dependencies
   */
  static create(input: CreatePersonDomainInput): PersonAggregate {
    const MAX_PHN_LENGTH = 20;
    const MAX_NAME_LENGTH = 100;
    const MIN_DISTRICT_ID = 1;

    // Domain validations
    if (input.firstName.length > MAX_NAME_LENGTH) {
      throw new Error(`firstName must not exceed ${MAX_NAME_LENGTH} characters`);
    }
    if (input.lastName.length > MAX_NAME_LENGTH) {
      throw new Error("lastName must not exceed 100 characters");
    }
    if (input.phoneNumber.length > MAX_PHN_LENGTH) {
      throw new Error(`phoneNumber must not exceed ${MAX_PHN_LENGTH} characters`);
    }
    if (input.districtId < MIN_DISTRICT_ID) {
      throw new Error("districtId must be a valid district");
    }

    // Convert string gender to value object with validation
    const gender = Gender.from(input.gender);

    // Create aggregate using factory method
    return PersonAggregate.create(
      input.firstName,
      input.lastName,
      input.address,
      gender,
      input.phoneNumber,
      input.districtId,
      input.birthdate || null,
      input.createdBy || 0
    );
  }
}
