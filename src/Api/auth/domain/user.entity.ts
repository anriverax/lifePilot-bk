import { User } from "@/prisma/generated/client";

export type AuthUser = Pick<User, "id" | "email" | "passwd" | "avatar" | "emailVerified">;
