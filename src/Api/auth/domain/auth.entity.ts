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
  birthdate?: Date | null;
  districtId: number;
  email: string;
  passwd: string;
}

export interface CreateAuthWithCreator extends Omit<CreateAuthInput, "email" | "passwd" | "roleId"> {
  userId: number;
  createdBy: number;
}
