import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  async check() {
    let db = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      db = 'error';
    }

    let redisStatus = 'disabled';
    if (this.redis.isAvailable()) {
      redisStatus = (await this.redis.ping()) ? 'ok' : 'error';
    }

    return {
      status: db === 'ok' ? 'ok' : 'degraded',
      db,
      redis: redisStatus,
      version: '1.0.0',
    };
  }
}
