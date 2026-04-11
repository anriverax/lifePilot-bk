import { Controller, Get } from "@nestjs/common";
import { HealthCheck } from "@nestjs/terminus";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@Controller("health")
@AllowAnonymous()
export class HealthController {
  constructor() {}

  @Get()
  @HealthCheck()
  check(): string {
    return "HOLA";
  }
}
