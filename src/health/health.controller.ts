import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { RedisHealthIndicator } from './redis-health.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prismaService: PrismaService,
    private readonly redisHealth: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): ReturnType<HealthCheckService['check']> {
    return this.health.check([
      (): Promise<HealthIndicatorResult> =>
        this.prismaHealth.pingCheck('database', this.prismaService, {
          timeout: 3000,
        }),
      (): Promise<HealthIndicatorResult> =>
        this.redisHealth.isHealthy('redis'),
    ]);
  }
}
