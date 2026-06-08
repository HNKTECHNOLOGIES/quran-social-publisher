import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  createdAt!: Date;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}

export class DashboardStatsDto {
  @ApiProperty()
  totalPosts!: number;

  @ApiProperty()
  scheduledPosts!: number;

  @ApiProperty()
  publishedPosts!: number;

  @ApiProperty({ nullable: true })
  lastPublishedAt!: Date | null;
}
