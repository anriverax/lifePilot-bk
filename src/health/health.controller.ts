import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckResult, HealthCheckService, HealthIndicatorResult } from "@nestjs/terminus";
import { PrismaService } from "@/services/prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> => {
        await this.prisma.$queryRaw`SELECT 1`;
        return { database: { status: "up" } };
      }
    ]);
  }
}
