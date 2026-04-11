import { User } from "@/prisma/generated/client";

export type AuthUser = Pick<User, "id" | "email" | "password" | "avatar" | "emailVerified">;
