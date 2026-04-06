export enum Gender {
  M = "M",
  H = "H"
}

export interface CreateAuthInput {
  firstName: string;
  lastName: string;
  address: string;
  gender: Gender;
  phoneNumber: string;
  birthdate?: Date;
  districtId: number;
  email: string;
  passwd: string;
  roleId: number;
}

export interface CreateAuthWithCreator extends CreateAuthInput {
  createdBy: number;
}
