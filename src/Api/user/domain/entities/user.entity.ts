export interface UserEntity {
  id: number;
  email: string;
  passwd: string;
  avatar: string | null;
  emailVerified: boolean;
  lastLoginDate: Date | null;
  roleId: number;
  personId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  updatedBy: number | null;
  deletedBy: number | null;
}
