import { IAuthEvent } from "@/core/auth/dto/auth.type";

export class UserRegisteredEvent {
  constructor(public readonly payload: IAuthEvent) {}
}
