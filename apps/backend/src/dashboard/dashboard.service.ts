import { Injectable } from '@nestjs/common';
import { PostStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardStatsDto } from '../common/dto/responses.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<DashboardStatsDto> {
    const [totalPosts, scheduledPosts, publishedPosts, lastPublished] =
      await Promise.all([
        this.prisma.post.count(),
        this.prisma.post.count({ where: { status: PostStatus.SCHEDULED } }),
        this.prisma.post.count({ where: { status: PostStatus.PUBLISHED } }),
        this.prisma.post.findFirst({
          where: { status: PostStatus.PUBLISHED, publishedAt: { not: null } },
          orderBy: { publishedAt: 'desc' },
          select: { publishedAt: true },
        }),
      ]);

    return {
      totalPosts,
      scheduledPosts,
      publishedPosts,
      lastPublishedAt: lastPublished?.publishedAt ?? null,
    };
  }
}
