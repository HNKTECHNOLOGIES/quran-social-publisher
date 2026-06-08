import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchVersesQueryDto {
  @ApiProperty({ example: 'miséricorde' })
  @IsString()
  q!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  size?: number = 10;
}

export class SurahVersesQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  perPage?: number = 20;
}

export class ChapterDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  nameSimple!: string;

  @ApiProperty()
  nameArabic!: string;

  @ApiProperty()
  translatedName!: string;

  @ApiProperty()
  versesCount!: number;

  @ApiProperty()
  revelationPlace!: string;
}

export class TafsirDto {
  @ApiProperty()
  source!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  available!: boolean;

  @ApiProperty({ nullable: true })
  content!: string | null;

  @ApiPropertyOptional()
  message?: string;
}

export class VerseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  verseKey!: string;

  @ApiProperty()
  surah!: number;

  @ApiProperty()
  verseNumber!: number;

  @ApiProperty()
  arabicText!: string;

  @ApiProperty()
  frenchTranslation!: string;

  @ApiProperty()
  englishTranslation!: string;

  @ApiProperty({ type: [TafsirDto] })
  tafsirs!: TafsirDto[];
}

export class VerseSummaryDto {
  @ApiProperty()
  verseKey!: string;

  @ApiProperty()
  surah!: number;

  @ApiProperty()
  verseNumber!: number;

  @ApiProperty()
  arabicText!: string;

  @ApiProperty({ nullable: true })
  englishSnippet!: string | null;
}

export class SearchVersesResponseDto {
  @ApiProperty()
  query!: string;

  @ApiProperty()
  totalResults!: number;

  @ApiProperty()
  currentPage!: number;

  @ApiProperty()
  totalPages!: number;

  @ApiProperty({ type: [VerseSummaryDto] })
  results!: VerseSummaryDto[];
}

export class SurahVersesResponseDto {
  @ApiProperty()
  surah!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  totalRecords!: number;

  @ApiProperty()
  totalPages!: number;

  @ApiProperty({ type: [VerseSummaryDto] })
  verses!: VerseSummaryDto[];
}
