import { PersonEntity } from "../entities/person.entity";

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
  create(data: CreatePersonData): Promise<PersonEntity>;
  findById(id: number): Promise<PersonEntity | null>;
}
