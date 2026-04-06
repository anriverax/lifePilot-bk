import { User } from "@prisma/client";

export type FindUserByIdOrEmailResponse = Pick<
  User,
  "id" | "email" | "passwd" | "avatar" | "emailVerified" | "personId"
>;
