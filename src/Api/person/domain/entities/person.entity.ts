/** Mirrors the Prisma TypeGender enum. M = Mujer (Female), H = Hombre (Male). */
export enum Gender {
  M = "M",
  H = "H",
}

export interface PersonEntity {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  gender: Gender;
  phoneNumber: string;
  birthdate: Date | null;
  districtId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdBy: number;
  updatedBy: number | null;
  deletedBy: number | null;
}
