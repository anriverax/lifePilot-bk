import { PersonEntity } from "../entities/person.entity";
import { PersonAggregate } from "../aggregates/person.aggregate";

export const SYSTEM_USER_ID = 0;

export interface CreatePersonData {
  firstName: string;
  lastName: string;
  address: string;
  gender: string;
  phoneNumber: string;
  birthdate?: Date | null;
  districtId: number;
  createdBy?: number;
}

export const PERSON_REPOSITORY = Symbol("PERSON_REPOSITORY");

export interface PersonRepositoryPort {
  /**
   * Save a Person aggregate to persistence
   * Accepts the domain aggregate and persists it
   */
  save(aggregate: PersonAggregate): Promise<number>;

  /**
   * Find a Person aggregate by ID
   * Returns the aggregate if found, null otherwise
   */
  findAggregateById(id: number): Promise<PersonAggregate | null>;

  /**
   * Find a Person entity (read model) by ID
   * Returns the entity for read operations
   */
  findById(id: number): Promise<PersonEntity | null>;

  /**
   * Create a new person (legacy - for backward compatibility)
   */
  create(data: CreatePersonData): Promise<PersonEntity>;

  /**
   * List all people (read model)
   */
  listAll(): Promise<PersonEntity[]>;
}
